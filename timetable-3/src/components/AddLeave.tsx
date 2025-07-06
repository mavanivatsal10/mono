import { useForm } from "react-hook-form";
import DatePicker from "./ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { isOverlaping } from "@/lib/utils";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { useEffect } from "react";
import type { slot } from "@/Types/types";
import { useTimetable } from "@/hooks/useTimetable";

export default function AddLeave({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { slots, setSlots, specificDates } = useTimetable();
  const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  const timeSchema = z
    .string()
    .regex(timeRegex, { message: "Please enter a valid time" });

  const formSchema = z
    .object({
      date: z.date().nullable(),
      holidayType: z.enum(["full", "half", "short"]),
      halfSession: z.enum(["morning", "afternoon"]).optional(),
      startTime: timeSchema,
      endTime: timeSchema,
    })
    .refine(
      (data) => {
        return data.date !== null;
      },
      {
        message: "Date is required",
        path: ["date"],
      }
    )
    .refine(
      (data) => {
        if (data.holidayType === "half") {
          return data.halfSession !== undefined;
        }
        return true;
      },
      {
        message: "Please select a session to add a leave",
        path: ["halfSession"],
      }
    )
    .refine(
      (data) => {
        if (data.holidayType === "short") {
          return data.startTime !== undefined;
        }
        return true;
      },
      {
        message: "Please enter start time",
        path: ["startTime"],
      }
    )
    .refine(
      (data) => {
        if (data.holidayType === "short") {
          return data.endTime !== undefined;
        }
        return true;
      },
      {
        message: "Please enter end time",
        path: ["endTime"],
      }
    )
    .refine(
      (data) => {
        return data.startTime < data.endTime || data.startTime === data.endTime;
      },
      {
        message: "End time must be on or after start time.",
        path: ["endTime"],
      }
    );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      holidayType: "full",
      halfSession: "morning",
      startTime: `${String(new Date().getHours()).padStart(2, "0")}:00`,
      endTime: `${String(
        new Date().getHours() === 23 ? 0 : new Date().getHours() + 1
      ).padStart(2, "0")}:00`,
    },
  });

  function addLeave(data: z.infer<typeof formSchema>) {
    /**
     * if user has specific schedule today:
     *  - find all the today's slots that intersect with the leave timings and remove them
     *  - push the leave slot
     *  - go through the day and add buffer if edited time is leaving time before/after neighboring slots
     * else slots.push(leave)
     */

    const leaveDate = format(data.date, "yyyy-MM-dd");
    const leaveStart = data.startTime;
    const leaveEnd = data.endTime;

    // check if intersecting with any other leave
    const leavesToday = slots.filter(
      (s) => s.type === "leave" && s.date === leaveDate
    );

    if (
      leavesToday.some((s) =>
        isOverlaping(
          { start: s.start, end: s.end },
          { start: leaveStart, end: leaveEnd }
        )
      )
    ) {
      form.setError("root", {
        message: "This leave is overlapping with another leave",
        type: "manual",
      });
      return;
    }

    if (specificDates.has(leaveDate)) {
      const slotsToday = slots.filter((s) => s.date === leaveDate);
      const cleanedSlots = slotsToday.filter(
        (s) =>
          !isOverlaping(
            { start: s.start, end: s.end },
            { start: leaveStart, end: leaveEnd }
          )
      );
      const id = uuidv4();
      cleanedSlots.push({
        id,
        date: leaveDate,
        start: leaveStart,
        end: leaveEnd,
        title: "Leave",
        description: "",
        type: "leave",
      });

      const sortedSlots = cleanedSlots.sort((a, b) =>
        a.start < b.start ? -1 : 1
      );

      const i = sortedSlots.findIndex((s) => s.id === id);

      if (i > 0) {
        const prevSlot = sortedSlots[i - 1];
        if (prevSlot.end < leaveStart) {
          sortedSlots.push({
            id: uuidv4(),
            date: leaveDate,
            start: prevSlot.end,
            end: leaveStart,
            title: "Buffer",
            description: "",
            type: "buffer",
          });
        }
      }

      if (i < sortedSlots.length - 1) {
        const nextSlot = sortedSlots[i + 1];
        if (leaveEnd < nextSlot.start) {
          sortedSlots.push({
            id: uuidv4(),
            date: leaveDate,
            start: leaveEnd,
            end: nextSlot.start,
            title: "Buffer",
            description: "",
            type: "buffer",
          });
        }
      }

      const remainingSlots = slots.filter((s) => s.date !== leaveDate);
      setSlots([...remainingSlots, ...sortedSlots]);
    } else {
      setSlots((prev) => [
        ...prev,
        {
          id: uuidv4(),
          date: leaveDate,
          start: leaveStart,
          end: leaveEnd,
          title: "Leave",
          description: "",
          type: "leave",
        },
      ]);
    }

    setOpen(false);
  }

  const watchHolidayType = form.watch("holidayType");
  const watchHalfSession = form.watch("halfSession");
  useEffect(() => {
    if (watchHolidayType === "full") {
      form.setValue("startTime", "09:00");
      form.setValue("endTime", "18:30");
    } else if (watchHolidayType === "half") {
      if (watchHalfSession === "morning") {
        form.setValue("startTime", "09:00");
        form.setValue("endTime", "13:00");
      } else {
        form.setValue("startTime", "13:45");
        form.setValue("endTime", "18:30");
      }
    }
  }, [watchHolidayType, watchHalfSession]);

  // remove leave overlapping error if time is acceptable
  const watchStartTime = form.watch("startTime");
  const watchEndTime = form.watch("endTime");
  const watchDate = form.watch("date");
  useEffect(() => {
    const leaveDate = format(watchDate as Date, "yyyy-MM-dd");

    const leavesToday = slots.filter(
      (s) => s.type === "leave" && s.date === leaveDate
    );

    if (
      leavesToday.some((s) =>
        isOverlaping(
          { start: s.start, end: s.end },
          { start: watchStartTime, end: watchEndTime }
        )
      )
    ) {
      return;
    }

    form.clearErrors("root");
  }, [watchStartTime, watchEndTime, watchDate]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(addLeave)}
        className="p-4 flex items-start justify-start w-full"
      >
        <div className="flex flex-col gap-8 w-full">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="w-50">
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <DatePicker {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="holidayType"
            render={({ field }) => (
              <FormItem className="w-full flex flex-col gap-4">
                <FormLabel>Select a type of leave:</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col"
                  >
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="full" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Full Holiday
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex flex-col justify-center gap-4">
                      <div className="flex items-center gap-3">
                        <FormControl>
                          <RadioGroupItem value="half" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Half day off
                        </FormLabel>
                      </div>
                      {/* Select a session: morning or afternoon */}
                      {field.value === "half" && (
                        <FormField
                          control={form.control}
                          name="halfSession"
                          render={({ field: halfSessionField }) => (
                            <RadioGroup
                              value={halfSessionField.value}
                              onValueChange={halfSessionField.onChange}
                              className="flex flex-col ml-8"
                            >
                              <FormItem className="flex items-center gap-3">
                                <FormControl>
                                  <RadioGroupItem value="morning" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Morning Session
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center gap-3">
                                <FormControl>
                                  <RadioGroupItem value="afternoon" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Afternoon Session
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          )}
                        />
                      )}
                    </FormItem>
                    <FormItem className="flex flex-col justify-center gap-4">
                      <div className="flex items-center gap-3">
                        <FormControl>
                          <RadioGroupItem value="short" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Short Leave
                        </FormLabel>
                      </div>
                      {/* Select start and end time */}
                      {field.value === "short" && (
                        <div className="flex gap-4 ml-8">
                          <FormField
                            control={form.control}
                            name="startTime"
                            render={({ field: startTimeField }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                  <Input
                                    type="time"
                                    {...startTimeField}
                                    className="flex items-center justify-center"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="endTime"
                            render={({ field: endTimeField }) => (
                              <FormItem className="flex-1">
                                <FormLabel>End Time</FormLabel>
                                <FormControl>
                                  <Input
                                    type="time"
                                    {...endTimeField}
                                    className="flex items-center justify-center"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.formState.errors.root && (
            <p className="text-destructive text-sm text-center">
              {form.formState.errors.root.message}
            </p>
          )}
          <div className="w-full flex justify-center">
            <Button type="submit" className="w-fit">
              Add a Leave
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

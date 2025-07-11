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
import { useTimetable } from "@/hooks/useTimetable";
import type { slot } from "@/types/types";
import { timeSchema } from "@/schemas/schemas";

export default function AddLeave({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { slots, setSlots, specificDates } = useTimetable();

  const formSchema = z
    .object({
      date: z.date().nullable(),
      holidayType: z.enum(["full", "half", "short"]),
      halfSession: z.enum(["morning", "afternoon"]).optional(),
      start: timeSchema,
      end: timeSchema,
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
          return data.start !== undefined;
        }
        return true;
      },
      {
        message: "Please enter start time",
        path: ["start"],
      }
    )
    .refine(
      (data) => {
        if (data.holidayType === "short") {
          return data.end !== undefined;
        }
        return true;
      },
      {
        message: "Please enter end time",
        path: ["end"],
      }
    )
    .refine(
      (data) => {
        return data.start < data.end || data.start === data.end;
      },
      {
        message: "End time must be on or after start time.",
        path: ["end"],
      }
    );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      holidayType: "full",
      halfSession: "morning",
      start: `${String(new Date().getHours()).padStart(2, "0")}:00`,
      end: `${String(
        new Date().getHours() === 23 ? 0 : new Date().getHours() + 1
      ).padStart(2, "0")}:00`,
    },
  });

  function addLeave(data: z.infer<typeof formSchema>) {
    /**
     * find all the today's slots that intersect with the leave timings and remove them
     * push the leave slot
     * if user has specific schedule today:
     *  - go through the day and add buffer if edited time is leaving time before/after neighboring slots
     */

    const leaveDate = format(data.date as Date, "yyyy-MM-dd");
    const leaveStart = data.start;
    const leaveEnd = data.end;

    // check if intersecting with any other leave
    const leavesToday = allSlots.filter(
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

    const slotsToday = allSlots.filter((s) => s.date === leaveDate);
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

    const remainingSlots = allSlots.filter((s) => s.date !== leaveDate);
    setSlots([...remainingSlots, ...cleanedSlots]);

    // add buffers if specific schedule today
    const generateBufferSlot = (start: string, end: string) => {
      return {
        id: uuidv4(),
        date: leaveDate,
        start,
        end,
        title: "Buffer",
        description: "",
        type: "buffer",
      } as slot;
    };

    if (specificDates.has(leaveDate)) {
      const sortedSlots = cleanedSlots.sort((a, b) =>
        a.start < b.start ? -1 : 1
      );

      const i = sortedSlots.findIndex((s) => s.id === id);

      if (i > 0) {
        const prevSlot = sortedSlots[i - 1];
        if (prevSlot.end < leaveStart) {
          if (prevSlot.type === "buffer") {
            prevSlot.end = leaveStart;
          } else {
            sortedSlots.push(generateBufferSlot(prevSlot.end, leaveStart));
          }
        }
      }

      if (i < sortedSlots.length - 1) {
        const nextSlot = sortedSlots[i + 1];
        if (leaveEnd < nextSlot.start) {
          if (nextSlot.type === "buffer") {
            nextSlot.start = leaveEnd;
          } else {
            sortedSlots.push(generateBufferSlot(leaveEnd, nextSlot.start));
          }
        }
      }

      setSlots([...remainingSlots, ...sortedSlots]);
    }

    setOpen(false);
  }

  const watchHolidayType = form.watch("holidayType");
  const watchHalfSession = form.watch("halfSession");
  useEffect(() => {
    if (watchHolidayType === "full") {
      form.setValue("start", "09:00");
      form.setValue("end", "18:30");
    } else if (watchHolidayType === "half") {
      if (watchHalfSession === "morning") {
        form.setValue("start", "09:00");
        form.setValue("end", "13:00");
      } else {
        form.setValue("start", "13:45");
        form.setValue("end", "18:30");
      }
    }
  }, [watchHolidayType, watchHalfSession]);

  // remove leave overlapping error if time is acceptable
  const watchstart = form.watch("start");
  const watchend = form.watch("end");
  const watchDate = form.watch("date");
  useEffect(() => {
    const leaveDate = format(watchDate as Date, "yyyy-MM-dd");

    const leavesToday = allSlots.filter(
      (s) => s.type === "leave" && s.date === leaveDate
    );

    if (
      leavesToday.some((s) =>
        isOverlaping(
          { start: s.start, end: s.end },
          { start: watchstart, end: watchend }
        )
      )
    ) {
      return;
    }

    form.clearErrors("root");
  }, [watchstart, watchend, watchDate]);

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
                            name="start"
                            render={({ field: startField }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                  <Input
                                    type="time"
                                    {...startField}
                                    className="flex items-center justify-center"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="end"
                            render={({ field: endField }) => (
                              <FormItem className="flex-1">
                                <FormLabel>End Time</FormLabel>
                                <FormControl>
                                  <Input
                                    type="time"
                                    {...endField}
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

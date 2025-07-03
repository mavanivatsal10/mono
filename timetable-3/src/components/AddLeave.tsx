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

export default function AddLeave() {
  const { slots, setSlots } = useTimetable();
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
    /**approach
     * find all the slots on that day
     *  - if there are no slots available on that date, it means that it uses default slots
     *  - in this case, make a copy of all the default slots with date = this date
     * find all the slots that intersect with the leave timings and remove them
     * push the leave slots
     */

    const leaveDate = format(data.date as Date, "yyyy-MM-dd");
    let slotsToday = slots.filter((slot: slot) => slot.date === leaveDate); // list of all slots on the day of leave

    if (slotsToday.length === 0) {
      const defaultSlots = slots.filter((s) => s.date === "default");

      slotsToday = defaultSlots.map((e) => {
        return { ...e, id: `${e.id}-${leaveDate}`, date: leaveDate };
      });
    }

    const leaveStart = data.startTime;
    const leaveEnd = data.endTime;

    const remainingSlots = slotsToday.filter((slot: slot) => {
      if (slot.type === "break") return true;
      return !isOverlaping(
        { start: slot.start, end: slot.end },
        { start: leaveStart, end: leaveEnd }
      );
    });

    const leaveSlot = {
      id: uuidv4(),
      title: "Leave",
      description: "",
      start: leaveStart,
      end: leaveEnd,
      date: leaveDate,
      type: "leave",
    };
    remainingSlots.push(leaveSlot as slot);

    // add buffer if edited time is leaving time before/after neighboring slots
    const sortedSlotsToday = remainingSlots.sort((a, b) =>
      a.start < b.start ? -1 : 1
    );

    let slotBefore, slotAfter;
    for (let i = 0; i < sortedSlotsToday.length; i++) {
      const slot = sortedSlotsToday[i];
      if (slot.id === leaveSlot.id) {
        slotBefore = i > 0 ? sortedSlotsToday[i - 1] : null;
        slotAfter =
          i < sortedSlotsToday.length - 1 ? sortedSlotsToday[i + 1] : null;
      }
    }

    if (slotBefore && slotBefore.end < leaveSlot.start) {
      remainingSlots.push({
        id: uuidv4(),
        date: leaveDate,
        start: slotBefore.end,
        end: leaveSlot.start,
        title: "Buffer",
        description: "",
        type: "buffer",
      });
    }

    if (slotAfter && leaveSlot.end < slotAfter.start) {
      remainingSlots.push({
        id: uuidv4(),
        date: leaveDate,
        start: leaveSlot.end,
        end: slotAfter.start,
        title: "Buffer",
        description: "",
        type: "buffer",
      });
    }

    const filteredSlots = slots.filter((s) => s.date !== leaveDate);
    const updatedSlots = filteredSlots.concat(remainingSlots);
    setSlots(updatedSlots);
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

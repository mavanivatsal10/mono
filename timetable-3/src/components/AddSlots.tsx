import { useForm, useFieldArray } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DatePicker from "@/components/ui/date-picker";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { v4 as uuidv4 } from "uuid";
import { useTimetable } from "@/hooks/useTimetable";
import type { slot } from "@/types/types";
import {
  isOverlaping,
  getTimeNumsFromString,
  getTimeStringFromNums,
  addMinutes,
  calculateSlotMinutes,
} from "@/lib/utils";
import { format } from "date-fns";
import { X } from "lucide-react";

export default function AddSlots({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { slots, setSlots, setSpecificDates } = useTimetable();

  const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  const timeSchema = z
    .string()
    .regex(timeRegex, { message: "Please enter a valid time" });

  const formSchema = z
    .object({
      title: z.string().min(1, "Title is required"),
      description: z.string(),
      date: z.union([z.date().nullable(), z.literal("default")]),
      isDefault: z.boolean(),
      startTime: timeSchema,
      endTime: timeSchema,
      breaks: z.array(
        z.object({
          startTime: timeSchema,
          endTime: timeSchema,
        })
      ),
      slotDuration: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.startTime > data.endTime || data.startTime === data.endTime) {
        ctx.addIssue({
          message: "End time must be after start time.",
          path: ["endTime"],
          code: z.ZodIssueCode.custom,
        });
      }

      if (!Number.isInteger(Number(data.slotDuration))) {
        ctx.addIssue({
          message: "Slot duration must be an integer.",
          path: ["slotDuration"],
          code: z.ZodIssueCode.custom,
        });
      }

      if (Number(data.slotDuration) < 15) {
        ctx.addIssue({
          message: "Slot duration must be at least 15 minutes.",
          path: ["slotDuration"],
          code: z.ZodIssueCode.custom,
        });
      }

      if (calculateSlotMinutes(data) < Number(data.slotDuration)) {
        ctx.addIssue({
          message: "Slot duration must not exceed total day time.",
          path: ["slotDuration"],
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.isDefault && !data.date) {
        ctx.addIssue({
          message: "Date is required.",
          path: ["date"],
          code: z.ZodIssueCode.custom,
        });
      }

      data.breaks.forEach((breakItem, index) => {
        if (
          breakItem.startTime < data.startTime ||
          breakItem.startTime > data.endTime
        ) {
          ctx.addIssue({
            message:
              "Break start time must be between start time and end time.",
            path: ["breaks", index, "startTime"],
            code: z.ZodIssueCode.custom,
          });
        }

        if (
          breakItem.endTime < data.startTime ||
          breakItem.endTime > data.endTime
        ) {
          ctx.addIssue({
            message: "Break end time must be between start time and end time.",
            path: ["breaks", index, "endTime"],
            code: z.ZodIssueCode.custom,
          });
        }

        if (
          data.breaks.some(
            (otherBreak, otherIndex) =>
              otherIndex !== index &&
              isOverlaping(
                { start: breakItem.startTime, end: breakItem.endTime },
                { start: otherBreak.startTime, end: otherBreak.endTime }
              )
          )
        ) {
          ctx.addIssue({
            message: "Breaks cannot overlap.",
            path: ["breaks", index],
            code: z.ZodIssueCode.custom,
          });
        }

        if (
          breakItem.endTime < breakItem.startTime ||
          breakItem.endTime === breakItem.startTime
        ) {
          ctx.addIssue({
            message: "Break end time must be after break start time.",
            path: ["breaks", index, "endTime"],
            code: z.ZodIssueCode.custom,
          });
        }

        const breakMins = calculateSlotMinutes(breakItem);

        if (breakMins > 45) {
          ctx.addIssue({
            message: "Breaks cannot be longer than 45 minutes.",
            path: ["breaks", index],
            code: z.ZodIssueCode.custom,
          });
        } else if (breakMins > 15) {
          const longestBreak = data.breaks.reduce((prev, curr) => {
            const prevMins = calculateSlotMinutes(prev);
            const currMins = calculateSlotMinutes(curr);
            return prevMins > currMins ? prev : curr;
          });
          const longestBreakMins = calculateSlotMinutes(longestBreak);
          if (longestBreak !== breakItem && longestBreakMins > 15) {
            ctx.addIssue({
              message: "Only one long break (> 15 minutes) is allowed.",
              path: ["breaks", index],
              code: z.ZodIssueCode.custom,
            });
          }
        }
      });
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "Timetable",
      description: "",
      date: new Date(),
      isDefault: true,
      startTime: "09:00",
      endTime: "18:30",
      breaks: [{ startTime: "13:00", endTime: "13:45" }],
      slotDuration: "60",
    },
  });

  const {
    fields: breaksFields,
    append: breaksAppend,
    remove: breaksRemove,
  } = useFieldArray({
    name: "breaks",
    control: form.control,
  });

  const watchIsDefault = form.watch("isDefault");

  const getAllSlots = (data: z.infer<typeof formSchema>) => {
    /**
     * generate slots based on form values
     * if set as default slot:
     *  - if default slots already exist, replace them
     *  - else push the generated slots
     * else (generate slots for specific date): // same logic as Calendar.tsx's getEvents() function's else clause
     *  - if there are slots available on that date, then push them
     *  - loop through newly generated slots and push non-overlapping slots
     *  - go through the day and add buffers for empty time blocks
     *  - add this date to specific dates set
     */

    const generateNewSlots = () => {
      /**
       * calculate number of breaks and loop that many times
       *  - generate slots before break
       *     - calculate # slots before break
       *     - if # slots before break > 0
       *        - add work slots
       *        - if last slot ends before break start, add buffer
       *     - else (no work slots before break)
       *        - if dayStart/prevSlotEnd before break start, add buffer
       *  - generate break
       * generate slots after last break
       *  - calculate # slots after last break
       *  - if # slots after last break > 0
       *     - add work slots
       *     - if last slot ends before day end, add buffer
       *  - else (no work slots after break)
       *     - if dayEnd after break end, add buffer
       */

      // form values
      const [dayStartHour, dayStartMinute] = getTimeNumsFromString(
        data.startTime
      );
      const [dayEndHour, dayEndMinute] = getTimeNumsFromString(data.endTime);
      const slotMinutes = Number(data.slotDuration);
      const numBreaks = data.breaks.length;

      const newSlots: {
        id: string;
        title: string;
        description: string;
        start: string;
        end: string;
        type: "slot" | "buffer" | "break";
      }[] = [];

      // loop through # (number of) breaks
      for (let i = 0; i < numBreaks; i++) {
        const [breakStartHour, breakStartMinute] = getTimeNumsFromString(
          data.breaks[i].startTime
        );
        const [breakEndHour, breakEndMinute] = getTimeNumsFromString(
          data.breaks[i].endTime
        );

        let beforeBreakMinutes = 0;
        if (i === 0) {
          beforeBreakMinutes =
            (breakStartHour - dayStartHour) * 60 +
            breakStartMinute -
            dayStartMinute;
        } else {
          const [prevBreakEndHour, prevBreakEndMinute] = getTimeNumsFromString(
            data.breaks[i - 1].endTime
          );
          beforeBreakMinutes =
            (breakStartHour - prevBreakEndHour) * 60 +
            breakStartMinute -
            prevBreakEndMinute;
        }
        const numSlotsBeforeBreak = Math.floor(
          beforeBreakMinutes / slotMinutes
        );

        if (numSlotsBeforeBreak > 0) {
          // generate work slots before break
          for (let j = 0; j < numSlotsBeforeBreak; j++) {
            let slotStartHour, slotStartMinute, slotEndHour, slotEndMinute;
            if (i === 0) {
              [slotStartHour, slotStartMinute] = addMinutes(
                dayStartHour,
                dayStartMinute,
                j * slotMinutes
              );
              [slotEndHour, slotEndMinute] = addMinutes(
                dayStartHour,
                dayStartMinute,
                (j + 1) * slotMinutes
              );
            } else {
              const [prevBreakEndHour, prevBreakEndMinute] =
                getTimeNumsFromString(data.breaks[i - 1].endTime);
              [slotStartHour, slotStartMinute] = addMinutes(
                prevBreakEndHour,
                prevBreakEndMinute,
                j * slotMinutes
              );
              [slotEndHour, slotEndMinute] = addMinutes(
                prevBreakEndHour,
                prevBreakEndMinute,
                (j + 1) * slotMinutes
              );
            }

            const slotStart = getTimeStringFromNums(
              slotStartHour,
              slotStartMinute
            );
            const slotEnd = getTimeStringFromNums(slotEndHour, slotEndMinute);

            newSlots.push({
              id: uuidv4(),
              title: "Work Slot",
              description: "",
              start: slotStart,
              end: slotEnd,
              type: "slot",
            });
          }

          // generate buffer slot if last slot ends before break start
          if (newSlots[newSlots.length - 1].end < data.breaks[i].startTime) {
            const lastSlot = newSlots[newSlots.length - 1];
            newSlots.push({
              id: uuidv4(),
              title: "Buffer Slot",
              description: "",
              start: lastSlot.end,
              end: data.breaks[i].startTime,
              type: "buffer",
            });
          }
        } else {
          if (i === 0) {
            if (data.startTime < data.breaks[i].startTime) {
              newSlots.push({
                id: uuidv4(),
                title: "Buffer Slot",
                description: "",
                start: data.startTime,
                end: data.breaks[i].startTime,
                type: "buffer",
              });
            }
          } else {
            const prevSlot = newSlots[newSlots.length - 1];
            if (prevSlot.end < data.breaks[i].startTime) {
              newSlots.push({
                id: uuidv4(),
                title: "Buffer Slot",
                description: "",
                start: prevSlot.end,
                end: data.breaks[i].startTime,
                type: "buffer",
              });
            }
          }
        }

        // generate break slot
        newSlots.push({
          id: uuidv4(),
          title: "Break",
          description: "",
          start: data.breaks[i].startTime,
          end: data.breaks[i].endTime,
          type: "break",
        });
      }

      // generate slots after last break
      let [lastBreakEndHour, lastBreakEndMinute] = [
        dayStartHour,
        dayStartMinute,
      ]; // if there is no break, we generate slots from day start
      if (numBreaks > 0) {
        [lastBreakEndHour, lastBreakEndMinute] = getTimeNumsFromString(
          data.breaks[numBreaks - 1].endTime
        );
      }

      const afterBreakMinutes =
        (dayEndHour - lastBreakEndHour) * 60 +
        dayEndMinute -
        lastBreakEndMinute;
      const numSlotsAfterBreak = Math.floor(afterBreakMinutes / slotMinutes);

      if (numSlotsAfterBreak > 0) {
        for (let j = 0; j < numSlotsAfterBreak; j++) {
          const [slotStartHour, slotStartMinute] = addMinutes(
            lastBreakEndHour,
            lastBreakEndMinute,
            j * slotMinutes
          );
          const [slotEndHour, slotEndMinute] = addMinutes(
            lastBreakEndHour,
            lastBreakEndMinute,
            (j + 1) * slotMinutes
          );

          const slotStart = getTimeStringFromNums(
            slotStartHour,
            slotStartMinute
          );
          const slotEnd = getTimeStringFromNums(slotEndHour, slotEndMinute);

          newSlots.push({
            id: uuidv4(),
            title: "Work Slot",
            description: "",
            start: slotStart,
            end: slotEnd,
            type: "slot",
          });
        }

        // generate buffer slot if last slot ends before day end
        if (newSlots[newSlots.length - 1].end < data.endTime) {
          const lastSlot = newSlots[newSlots.length - 1];
          newSlots.push({
            id: uuidv4(),
            title: "Buffer Slot",
            description: "",
            start: lastSlot.end,
            end: data.endTime,
            type: "buffer",
          });
        }
      } else {
        if (newSlots[newSlots.length - 1].end < data.endTime) {
          newSlots.push({
            id: uuidv4(),
            title: "Buffer Slot",
            description: "",
            start: newSlots[newSlots.length - 1].end,
            end: data.endTime,
            type: "buffer",
          });
        }
      }

      return newSlots;
    };

    const newSlots = generateNewSlots();

    if (data.isDefault) {
      const remainingSlots = slots.filter(
        (slot: slot) => slot.date !== "default"
      );

      const dateAdded = newSlots.map((s) => ({
        ...s,
        date: "default",
      }));

      setSlots([...remainingSlots, ...dateAdded]);
    } else {
      const date = format(data.date as Date, "yyyy-MM-dd");
      const slotsToday = slots.filter((slot: slot) => slot.date === date);
      const cleanedSlots = [];
      cleanedSlots.push(...slotsToday);

      for (const slot of newSlots) {
        if (
          !slotsToday.some((s) =>
            isOverlaping(
              { start: s.start, end: s.end },
              { start: slot.start, end: slot.end }
            )
          )
        ) {
          cleanedSlots.push(slot);
        }
      }

      // add buffer slots
      const sortedSlots = cleanedSlots.sort((a, b) =>
        a.start < b.start ? -1 : 1
      );

      if (sortedSlots.length === 0) {
        setOpen(false);
        return;
      }

      const dayStart = data.startTime;
      const dayEnd = data.endTime;

      for (let i = 0; i < sortedSlots.length; i++) {
        const slot = sortedSlots[i];
        const slotStart = slot.start;
        const slotEnd = slot.end;

        const nextSlot = sortedSlots[i + 1];
        if (nextSlot === undefined) {
          continue;
        }
        const nextSlotStart = nextSlot.start;

        if (i === 0) {
          if (slotStart > dayStart) {
            cleanedSlots.push({
              id: uuidv4(),
              title: "Buffer",
              description: "",
              start: dayStart,
              end: slotStart,
              type: "buffer",
            });
          }
          if (slotEnd < nextSlotStart) {
            cleanedSlots.push({
              id: uuidv4(),
              title: "Buffer",
              description: "",
              start: slotEnd,
              end: nextSlotStart,
              type: "buffer",
            });
          }
        } else if (i === sortedSlots.length - 1 && slotEnd < dayEnd) {
          cleanedSlots.push({
            id: uuidv4(),
            title: "Buffer",
            description: "",
            start: slotEnd,
            end: dayEnd,
            type: "buffer",
          });
        } else if (slotEnd < nextSlotStart) {
          cleanedSlots.push({
            id: uuidv4(),
            title: "Buffer",
            description: "",
            start: slotEnd,
            end: nextSlotStart,
            type: "buffer",
          });
        }
      }

      const dateAdded = cleanedSlots.map((s) => ({
        ...s,
        date,
      }));

      setSlots((prev) => {
        const temp = prev.filter((s) => s.date !== date);
        return [...temp, ...(dateAdded as slot[])];
      });
      setSpecificDates((prev) => new Set(prev).add(date));
    }
    setOpen(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(getAllSlots)}
        className="p-4 flex items-center justify-center"
      >
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="flex w-full gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
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
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      className="flex items-center justify-center"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col gap-4 w-full">
            {breaksFields.map((_, index) => (
              <div
                className="flex flex-col gap-4 w-full items-center justify-center"
                key={index}
              >
                <div className="flex w-full gap-4 items-center">
                  <FormField
                    control={form.control}
                    name={`breaks.${index}.startTime`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Break {index + 1} Start Time</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            className="flex items-center justify-center"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`breaks.${index}.endTime`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Break {index + 1} End Time</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            className="flex items-center justify-center"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <X
                    onClick={() => breaksRemove(index)}
                    className="text-destructive"
                  />
                </div>
                {form.formState.errors.breaks?.[index] && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.breaks[index].message}
                  </p>
                )}
              </div>
            ))}
            {breaksFields.length < 3 && (
              <Button
                type="button"
                onClick={() => breaksAppend({ startTime: "", endTime: "" })}
                variant="ghost"
              >
                + Add Break
              </Button>
            )}
          </div>
          <div className="flex gap-4 w-full">
            <FormField
              control={form.control}
              name="slotDuration"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>
                    Slot duration
                    <span className="font-normal">(min)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      className="flex items-center justify-center"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel
                    className={watchIsDefault ? "text-muted-foreground" : ""}
                  >
                    Date
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      value={
                        !form.getValues("isDefault")
                          ? (field.value as Date)
                          : undefined
                      }
                      onChange={field.onChange}
                      disabled={watchIsDefault}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="set-default-slot-values"
                    />
                    <Label
                      className="font-normal"
                      htmlFor="set-default-slot-values"
                    >
                      Set as default slots for all dates
                    </Label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Generate Slots</Button>
        </div>
      </form>
    </Form>
  );
}

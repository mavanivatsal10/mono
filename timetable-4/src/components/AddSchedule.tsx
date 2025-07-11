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
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { timeSchema } from "@/schemas/schemas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function AddSchedule() {
  const { setAllSlots, isOpenAdd, setIsOpenAdd } = useTimetable();
  const [isSubmitClicked, setIsSubmitClicked] = useState(false); // flag to show/remove errors

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const formSchema = z
    .object({
      date: z.union([z.date().nullable(), z.literal("default")]),
      isDefault: z.boolean(),
      month: z.enum(["", ...months]),
      start: timeSchema,
      end: timeSchema,
      breaks: z.array(
        z.object({
          start: timeSchema,
          end: timeSchema,
          overlap: z.boolean().optional(),
          shortBreak: z.boolean().optional(),
          longBreak: z.boolean().optional(),
        })
      ),
      slotDuration: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.start > data.end || data.start === data.end) {
        ctx.addIssue({
          message: "End time must be after start time.",
          path: ["end"],
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

      const sortedBreaks = [...data.breaks].sort((a, b) =>
        a.start < b.start ? -1 : 1
      );

      console.log(sortedBreaks);

      for (let i = 0; i < sortedBreaks.length; i++) {
        if (sortedBreaks[i].start === "" || sortedBreaks[i].end === "") {
          continue;
        }
        if (i === 0) {
          if (
            calculateSlotMinutes({
              start: data.start,
              end: sortedBreaks[i].start,
            }) < 15
          ) {
            const index = data.breaks.findIndex(
              (b) => b.start === sortedBreaks[i].start
            );
            ctx.addIssue({
              message:
                "Break cannot start within 15 minutes of day start time.",
              path: ["breaks", index, "start"],
              code: z.ZodIssueCode.custom,
            });
          }
          if (
            sortedBreaks.length > 1 &&
            calculateSlotMinutes({
              start: sortedBreaks[i].end,
              end: sortedBreaks[i + 1].start,
            }) < 15
          ) {
            const i1 = data.breaks.findIndex(
              (b) => b.start === sortedBreaks[i].start
            );
            ctx.addIssue({
              message: "Consecutive breaks cannot be within 15 minutes.",
              path: ["breaks", i1, "end"],
              code: z.ZodIssueCode.custom,
            });
            const i2 = data.breaks.findIndex(
              (b) => b.start === sortedBreaks[i + 1].start
            );
            ctx.addIssue({
              message: "Consecutive breaks cannot be within 15 minutes.",
              path: ["breaks", i2, "start"],
              code: z.ZodIssueCode.custom,
            });
          }
        } else if (i === sortedBreaks.length - 1) {
          if (
            calculateSlotMinutes({
              start: sortedBreaks[i].end,
              end: data.end,
            }) < 15
          ) {
            const index = data.breaks.findIndex(
              (b) => b.start === sortedBreaks[i].start
            );
            ctx.addIssue({
              message: "Break cannot end within 15 minutes of day end time.",
              path: ["breaks", index, "end"],
              code: z.ZodIssueCode.custom,
            });
          }
        } else {
          if (
            calculateSlotMinutes({
              start: sortedBreaks[i].end,
              end: sortedBreaks[i + 1].start,
            }) < 15
          ) {
            const i1 = data.breaks.findIndex(
              (b) => b.start === sortedBreaks[i].start
            );
            ctx.addIssue({
              message: "Breaks cannot be within 15 minutes.",
              path: ["breaks", i1, "end"],
              code: z.ZodIssueCode.custom,
            });
            const i2 = data.breaks.findIndex(
              (b) => b.start === sortedBreaks[i + 1].start
            );
            ctx.addIssue({
              message: "Breaks cannot be within 15 minutes.",
              path: ["breaks", i2, "start"],
              code: z.ZodIssueCode.custom,
            });
          }
        }
      }

      data.breaks.forEach((breakItem, index) => {
        if (breakItem.start < data.start || breakItem.start > data.end) {
          ctx.addIssue({
            message:
              "Break start time must be between start time and end time.",
            path: ["breaks", index, "start"],
            code: z.ZodIssueCode.custom,
          });
        }

        if (breakItem.end < data.start || breakItem.end > data.end) {
          ctx.addIssue({
            message: "Break end time must be between start time and end time.",
            path: ["breaks", index, "end"],
            code: z.ZodIssueCode.custom,
          });
        }

        if (
          data.breaks.some(
            (otherBreak, otherIndex) =>
              otherIndex !== index &&
              isOverlaping(
                { start: breakItem.start, end: breakItem.end },
                { start: otherBreak.start, end: otherBreak.end }
              )
          )
        ) {
          ctx.addIssue({
            message: "Breaks cannot overlap.",
            path: ["breaks", index, "overlap"],
            code: z.ZodIssueCode.custom,
          });
        }

        if (
          breakItem.end < breakItem.start ||
          breakItem.end === breakItem.start
        ) {
          ctx.addIssue({
            message: "Break end time must be after break start time.",
            path: ["breaks", index, "end"],
            code: z.ZodIssueCode.custom,
          });
        }

        const breakMins = calculateSlotMinutes(breakItem);

        if (breakMins > 45) {
          ctx.addIssue({
            message: "Breaks cannot be longer than 45 minutes.",
            path: ["breaks", index, "longBreak"],
            code: z.ZodIssueCode.custom,
          });
        } else if (breakMins > 15) {
          const longestBreak = data.breaks.reduce(
            (prev, curr) => {
              const prevMins = calculateSlotMinutes(prev);
              const currMins = calculateSlotMinutes(curr);
              return prevMins > currMins ? prev : curr;
            },
            { start: "00:00", end: "00:00" }
          );
          const longestBreakMins = calculateSlotMinutes(longestBreak);
          if (longestBreak !== breakItem && longestBreakMins > 15) {
            ctx.addIssue({
              message: "Only one long break (> 15 minutes) is allowed.",
              path: ["breaks", index, "shortBreak"],
              code: z.ZodIssueCode.custom,
            });
          }
        }
      });
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: isOpenAdd.addSchedule || {
      date: new Date(),
      month: months[new Date().getMonth()],
      isDefault: true,
      start: "09:00",
      end: "18:30",
      breaks: [{ start: "13:00", end: "13:45" }],
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
    // if set as default, add else replace

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
      const [dayStartHour, dayStartMinute] = getTimeNumsFromString(data.start);
      const [dayEndHour, dayEndMinute] = getTimeNumsFromString(data.end);
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

      const sortedBreaks = data.breaks.sort((a, b) =>
        a.start < b.start ? -1 : 1
      );

      // loop through # (number of) breaks
      for (let i = 0; i < numBreaks; i++) {
        const [breakStartHour, breakStartMinute] = getTimeNumsFromString(
          sortedBreaks[i].start
        );

        let beforeBreakMinutes = 0;
        if (i === 0) {
          beforeBreakMinutes =
            (breakStartHour - dayStartHour) * 60 +
            breakStartMinute -
            dayStartMinute;
        } else {
          const [prevBreakEndHour, prevBreakEndMinute] = getTimeNumsFromString(
            sortedBreaks[i - 1].end
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
                getTimeNumsFromString(sortedBreaks[i - 1].end);
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
          if (newSlots[newSlots.length - 1].end < sortedBreaks[i].start) {
            const lastSlot = newSlots[newSlots.length - 1];
            newSlots.push({
              id: uuidv4(),
              title: "Buffer Slot",
              description: "",
              start: lastSlot.end,
              end: sortedBreaks[i].start,
              type: "buffer",
            });
          }
        } else {
          if (i === 0) {
            if (data.start < sortedBreaks[i].start) {
              newSlots.push({
                id: uuidv4(),
                title: "Buffer Slot",
                description: "",
                start: data.start,
                end: sortedBreaks[i].start,
                type: "buffer",
              });
            }
          } else {
            const prevSlot = newSlots[newSlots.length - 1];
            if (prevSlot.end < sortedBreaks[i].start) {
              newSlots.push({
                id: uuidv4(),
                title: "Buffer Slot",
                description: "",
                start: prevSlot.end,
                end: sortedBreaks[i].start,
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
          start: sortedBreaks[i].start,
          end: sortedBreaks[i].end,
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
          data.breaks[numBreaks - 1].end
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
        if (newSlots[newSlots.length - 1].end < data.end) {
          const lastSlot = newSlots[newSlots.length - 1];
          newSlots.push({
            id: uuidv4(),
            title: "Buffer Slot",
            description: "",
            start: lastSlot.end,
            end: data.end,
            type: "buffer",
          });
        }
      } else {
        if (newSlots[newSlots.length - 1].end < data.end) {
          newSlots.push({
            id: uuidv4(),
            title: "Buffer Slot",
            description: "",
            start: newSlots[newSlots.length - 1].end,
            end: data.end,
            type: "buffer",
          });
        }
      }

      return newSlots;
    };

    const generated: { date: string; slots: slot[] }[] = [];

    if (data.isDefault) {
      const monthIndex = months.findIndex((m) => m === data.month);
      const month = String(monthIndex + 1).padStart(2, "0");
      const year = String(new Date().getFullYear());

      for (
        let i = 0;
        i < new Date(Number(year), monthIndex, 0).getDate();
        i++
      ) {
        const day = String(i + 1).padStart(2, "0");
        const date = `${year}-${month}-${day}`;

        generated.push({
          date,
          slots: generateNewSlots() as slot[],
        });
      }

      setAllSlots(generated);
    }
    setIsOpenAdd({
      open: false,
      addSchedule: null,
      addSlot: null,
      addLeave: null,
    });
  };

  // remove errors if conditions are met else add them
  const watchBreaks = form.watch("breaks");
  const dependency = watchBreaks
    .map((b, i) => `break-${i + 1}-${b.start}-${b.end}`)
    .join("|"); // useEffect should re-render whenever there is change in any of the start or end
  useEffect(() => {
    const starts = [];
    const ends = [];
    for (let i = 0; i < watchBreaks.length; i++) {
      starts.push(watchBreaks[i].start);
      ends.push(watchBreaks[i].end);

      // remove "Breaks cannot be longer than 45 minutes."
      if (
        calculateSlotMinutes({
          start: starts[i],
          end: ends[i],
        }) <= 45
      ) {
        form.clearErrors(`breaks.${i}.longBreak`);
      } else if (isSubmitClicked) {
        form.setError(`breaks.${i}.longBreak`, {
          message: "Breaks cannot be longer than 45 minutes.",
          type: "manual",
        });
      }

      // remove "Only one long break (> 15 minutes) is allowed."
      const longestBreak = watchBreaks.reduce(
        (prev, curr) => {
          const prevMins = calculateSlotMinutes(prev);
          const currMins = calculateSlotMinutes(curr);
          return prevMins > currMins ? prev : curr;
        },
        { start: "00:00", end: "00:00" }
      );
      const longestBreakMins = calculateSlotMinutes(longestBreak);
      if (longestBreakMins > 15) {
        for (let j = 0; j < watchBreaks.length; j++) {
          const currentBreakMins = calculateSlotMinutes({
            start: starts[j],
            end: ends[j],
          });
          if (longestBreak !== watchBreaks[j] && currentBreakMins <= 15) {
            form.clearErrors(`breaks.${j}.shortBreak`);
          } else if (
            longestBreak !== watchBreaks[j] &&
            currentBreakMins > 15 &&
            isSubmitClicked
          ) {
            form.setError(`breaks.${i}.shortBreak`, {
              message: "Only one long break (> 15 minutes) is allowed.",
              type: "manual",
            });
          }
        }
      }

      // remove "Breaks cannot overlap."
      if (
        !watchBreaks.some(
          (otherBreak, otherIndex) =>
            otherIndex !== i &&
            isOverlaping(
              { start: watchBreaks[i].start, end: watchBreaks[i].end },
              { start: otherBreak.start, end: otherBreak.end }
            )
        )
      ) {
        form.clearErrors(`breaks.${i}.overlap`);
      } else if (isSubmitClicked) {
        form.setError(`breaks.${i}.overlap`, {
          message: "Breaks cannot overlap.",
          type: "manual",
        });
      }
    }
  }, [dependency]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(getAllSlots)}
        className="px-10 py-4 flex items-center justify-center"
      >
        <div className="flex flex-col items-center justify-center gap-4 w-full">
          <div className="flex w-full gap-4">
            <FormField
              control={form.control}
              name="start"
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
              name="end"
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
                    name={`breaks.${index}.start`}
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
                    name={`breaks.${index}.end`}
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
                {form.formState.errors.breaks?.[index]?.shortBreak && (
                  <p className="text-destructive text-sm text-center">
                    {form.formState.errors.breaks[index].shortBreak.message}
                  </p>
                )}
                {form.formState.errors.breaks?.[index]?.longBreak && (
                  <p className="text-destructive text-sm text-center">
                    {form.formState.errors.breaks[index].longBreak.message}
                  </p>
                )}
                {form.formState.errors.breaks?.[index]?.overlap && (
                  <p className="text-destructive text-sm text-center">
                    {form.formState.errors.breaks[index].overlap.message}
                  </p>
                )}
              </div>
            ))}
            {breaksFields.length < 3 && (
              <Button
                type="button"
                onClick={() => breaksAppend({ start: "", end: "" })}
                variant="ghost"
              >
                + Add Break
              </Button>
            )}
          </div>
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
          <div className="flex gap-4 w-full">
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

            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Month</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={
                      watchIsDefault
                        ? field.value
                          ? field.value
                          : months[new Date().getMonth()]
                        : undefined
                    }
                    disabled={!watchIsDefault}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a Month" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
          <Button type="submit" onClick={() => setIsSubmitClicked(true)}>
            Generate Slots
          </Button>
        </div>
      </form>
    </Form>
  );
}

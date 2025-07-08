import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useTimetable } from "@/hooks/useTimetable";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { timeSchema } from "@/schemas/schemas";
import DatePicker from "./ui/date-picker";
import { v4 as uuidv4 } from "uuid";
import type { slot } from "@/types/types";
import { format, parse } from "date-fns";
import { calculateSlotMinutes, isContains, isOverlaping } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function EditEvent() {
  const { editEvent, setEditEvent } = useTimetable();

  return (
    <Dialog
      open={editEvent.showOverlay}
      onOpenChange={(open) =>
        setEditEvent({
          showOverlay: open,
          eventData: open ? editEvent.eventData : null,
        })
      }
    >
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px] overflow-auto"
        style={{ maxHeight: `${window.innerHeight - 100}px` }}
      >
        <EditForm />
      </DialogContent>
    </Dialog>
  );
}

function EditForm() {
  const {
    slots,
    setSlots,
    specificDates,
    editEvent: { eventData: event },
    setEditEvent,
  } = useTimetable();

  const [isConfirmClicked, setIsConfirmClicked] = useState(false);

  // calculation of various variables
  const slot = slots.find((s) => s.id === event?._def.extendedProps.slotId);
  let visibleSlotsToday: slot[] = slots.filter((s) => s.date === slot?.date);
  let sortedVisibleSlotsToday = visibleSlotsToday.sort((a, b) =>
    a.start < b.start ? -1 : 1
  );
  if (!specificDates.has(slot?.date as string)) {
    // if original slot is default slot
    const defaultSlots = slots.filter((s) => s.date === "default");
    let toBeAdded = slots.filter(
      (s) => s.date === format(event?.start as Date, "yyyy-MM-dd")
    );
    const noEventsToday = toBeAdded.filter((s) => s.type === "no-events");
    toBeAdded = toBeAdded.filter(
      (s) =>
        !noEventsToday.some(
          (n) =>
            n.id !== s.id &&
            isOverlaping(
              { start: n.start, end: n.end },
              { start: s.start, end: s.end }
            )
        )
    );

    const filteredDefaultSlots = defaultSlots.filter(
      (s) =>
        !toBeAdded.some(
          (t) =>
            t.id !== s.id &&
            isOverlaping(
              { start: s.start, end: s.end },
              { start: t.start, end: t.end }
            )
        )
    );
    visibleSlotsToday = filteredDefaultSlots.concat(toBeAdded);
  }
  sortedVisibleSlotsToday = visibleSlotsToday.sort((a, b) =>
    a.start < b.start ? -1 : 1
  );
  const dayStart = sortedVisibleSlotsToday[0].start;
  const dayEnd =
    sortedVisibleSlotsToday[sortedVisibleSlotsToday.length - 1].end;
  const breaksToday = sortedVisibleSlotsToday.filter((s) => s.type === "break");
  let longestBreak: slot, longestBreakMins: number;
  if (breaksToday.length > 0) {
    longestBreak = breaksToday.reduce((prev, curr) => {
      const prevMins = calculateSlotMinutes(prev);
      const currMins = calculateSlotMinutes(curr);
      return prevMins > currMins ? prev : curr;
    });
    longestBreakMins = calculateSlotMinutes(longestBreak);
  }
  const leavesToday = sortedVisibleSlotsToday.filter((s) => s.type === "leave");
  const defaultDate = format(event?.start as Date, "yyyy-MM-dd");
  const defaultStart = format(new Date(event?.start as Date), "HH:mm");
  const defaultEnd = format(event?.end as Date, "HH:mm");

  const formSchema = z
    .object({
      title: z.string(),
      description: z.string(),
      start: timeSchema,
      end: timeSchema,
      date: z.date().nullable(),
      breakError: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.start > data.end || data.start === data.end) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End time must be after start time.",
          path: ["end"],
        });
      }

      if (data.date === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Date is required.",
          path: ["date"],
        });
      }

      if (data.title.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Title is required",
          path: ["title"],
        });
      }

      if (slot?.type === "break") {
        const dayStart12 = parse(dayStart, "HH:mm", new Date());
        const dayEnd12 = parse(dayEnd, "HH:mm", new Date());

        if (data.start < dayStart || data.start > dayEnd) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Break start time must be between start time and end time of the working day (${format(
              dayStart12,
              "hh:mm a"
            )} - ${format(dayEnd12, "hh:mm a")}).`,
            path: ["start"],
          });
        }

        if (data.end < dayStart || data.end > dayEnd) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Break end time must be between start time and end time of the working day (${format(
              dayStart12,
              "hh:mm a"
            )} - ${format(dayEnd12, "hh:mm a")}).`,
            path: ["end"],
          });
        }

        if (
          breaksToday?.some(
            (otherBreak) =>
              otherBreak.id !== slot?.id &&
              isOverlaping(
                { start: otherBreak.start, end: otherBreak.end },
                { start: data.start, end: data.end }
              )
          )
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "New timing is overlapping with another break.",
            path: ["breakError"],
          });
        }

        const breakMins = calculateSlotMinutes({
          start: data.start,
          end: data.end,
        });
        if (breakMins > 45) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Breaks cannot be longer than 45 minutes.",
            path: ["breakError"],
          });
        } else if (breakMins > 15) {
          if (longestBreak !== slot && longestBreakMins > 15) {
            ctx.addIssue({
              message: "Only one long break (> 15 minutes) is allowed.",
              path: ["breakError"],
              code: z.ZodIssueCode.custom,
            });
          }
        }
      }

      if (slot?.type === "leave") {
        if (
          leavesToday?.some(
            (otherLeave) =>
              otherLeave.id !== slot?.id &&
              isOverlaping(
                { start: otherLeave.start, end: otherLeave.end },
                { start: data.start, end: data.end }
              )
          )
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "New timing is overlapping with another leave.",
            path: ["breakError"],
          });
        }
      }
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: slot?.title || "",
      description: slot?.description || "",
      start: slot?.start || "",
      end: slot?.end || "",
      date: event?.start || new Date(),
    },
  });

  const editSlot = (data: z.infer<typeof formSchema>) => {
    /**
     * if all values are same as before, do nothing
     * create an edited slot
     * if edited slot's times are out of bounds of original times, add "no-events" to original times
     * else:
     *  - if edited start time is after original start time:
     *     - add "no-events"
     *  - else (new start time is before original start time):
     *     - if there is "no-events" whose start and end time are within edited slot's start and end time, remove it
     *     - else if there is "no-events" event whose end time is within edited slot's start and end time, change its end time to edited slot's start time
     *  - if edited end time is before original end time:
     *     - add "no-events"
     *  - else (new end time is after original end time):
     *     - if there is "no-events" whose start and end time are within edited slot's start and end time, remove it
     *     - else if there is "no-events" event whose start time is within edited slot's end time, change its start time to edited slot's end time
     * if original slot is default slot, push edited slot
     * else edit the original slot
     */

    const editedSlot: slot = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      start: data.start,
      end: data.end,
      date: format(data.date as Date, "yyyy-MM-dd"),
      type: slot?.type || "slot",
    };

    if (
      slot?.title === editedSlot.title &&
      slot?.description === editedSlot.description &&
      slot?.start === editedSlot.start &&
      slot?.end === editedSlot.end &&
      slot?.date === editedSlot.date
    ) {
      setEditEvent({ showOverlay: false, eventData: null });
      return;
    }

    let newSlotsToday = slots.filter(
      (s) =>
        s.date === editedSlot.date &&
        !isOverlaping(
          { start: s.start, end: s.end },
          { start: editedSlot.start, end: editedSlot.end }
        )
    );
    const generateNoEvents = (start: string, end: string) => {
      return {
        id: uuidv4(),
        title: "No events",
        description: "",
        start: start,
        end: end,
        date: format(data.date as Date, "yyyy-MM-dd"),
        type: "no-events",
      } as slot;
    };

    const originalStart = slot?.start as string;
    const originalEnd = slot?.end as string;

    if (
      (editedSlot.start < originalStart && editedSlot.end < originalStart) ||
      (editedSlot.start > originalEnd && editedSlot.end > originalEnd)
    ) {
      newSlotsToday.push(generateNoEvents(originalStart, originalEnd));
    } else {
      if (editedSlot.start > originalStart) {
        newSlotsToday.push(generateNoEvents(originalStart, editedSlot.start));
      } else if (editedSlot.start < originalStart) {
        newSlotsToday = newSlotsToday.filter(
          (s) => !(s.type === "no-events" && isContains(editedSlot, s))
        );

        for (let i = 0; i < newSlotsToday.length; i++) {
          const curr = newSlotsToday[i];
          if (
            curr.type === "no-events" &&
            curr.end > editedSlot.start &&
            (curr.end < editedSlot.end || curr.end === editedSlot.end)
          ) {
            curr.end = editedSlot.start;
          }
        }
      }

      if (editedSlot.end < originalEnd) {
        newSlotsToday.push(generateNoEvents(editedSlot.end, originalEnd));
      } else if (editedSlot.end > originalEnd) {
        newSlotsToday = newSlotsToday.filter(
          (s) => !(s.type === "no-events" && isContains(editedSlot, s))
        );

        for (let i = 0; i < newSlotsToday.length; i++) {
          const curr = newSlotsToday[i];
          if (
            curr.type === "no-events" &&
            curr.start > editedSlot.start &&
            (curr.start < editedSlot.end || curr.start === editedSlot.end)
          ) {
            curr.start = editedSlot.end;
          }
        }
      }
    }

    let todayFiltered = slots.filter((s) => s.date !== editedSlot.date);
    if (slot?.date !== "default") {
      todayFiltered = todayFiltered.filter((s) => s.id !== slot?.id);
    }
    setSlots([...todayFiltered, ...newSlotsToday, editedSlot]);
    setEditEvent({ showOverlay: false, eventData: null });
  };

  const deleteSlot = () => {
    /**
     * if default slot, add buffer of that duration
     * else, remove slot
     */
    if (slot?.date === "default") {
      setSlots((prev) => [
        ...prev,
        {
          id: uuidv4(),
          title: "Buffer",
          description: "",
          start: defaultStart,
          end: defaultEnd,
          date: defaultDate,
          type: "buffer",
        },
      ]);
    } else {
      setSlots((prev) => prev.filter((s) => s.id !== slot?.id));
    }
    setEditEvent({ showOverlay: false, eventData: null });
  };

  // add/remove errors once confirm button is clicked
  const watchStart = form.watch("start");
  const watchEnd = form.watch("end");
  const dependency = watchStart + watchEnd;
  useEffect(() => {
    if (!isConfirmClicked) return;

    if (slot?.type === "break") {
      if (
        breaksToday?.some(
          (otherBreak) =>
            otherBreak.id !== slot?.id &&
            isOverlaping(
              { start: otherBreak.start, end: otherBreak.end },
              { start: watchStart, end: watchEnd }
            )
        )
      ) {
        form.setError("breakError", {
          message: "New timing is overlapping with another break.",
          type: "manual",
        });
      } else {
        form.clearErrors("breakError");
      }

      const breakMins = calculateSlotMinutes({
        start: watchStart,
        end: watchEnd,
      });
      if (breakMins > 45) {
        form.setError("breakError", {
          message: "Breaks cannot be longer than 45 minutes.",
          type: "manual",
        });
      } else if (breakMins > 15) {
        if (longestBreak !== slot && longestBreakMins > 15) {
          form.setError("breakError", {
            message: "Only one long break (> 15 minutes) is allowed.",
            type: "manual",
          });
        }
      } else {
        form.clearErrors("breakError");
      }
    } else if (slot?.type === "leave") {
      if (
        leavesToday?.some(
          (otherLeave) =>
            otherLeave.id !== slot?.id &&
            isOverlaping(
              { start: otherLeave.start, end: otherLeave.end },
              { start: watchStart, end: watchEnd }
            )
        )
      ) {
        form.setError("breakError", {
          message: "New timing is overlapping with another leave.",
          type: "manual",
        });
      } else {
        form.clearErrors("breakError");
      }
    }
  }, [dependency]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(editSlot)}
        className="p-4 flex items-center justify-center"
      >
        <div className="flex flex-col items-center justify-center gap-6 w-full">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input type="text" {...field} placeholder="Add Title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Add Description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="w-1/2">
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value ? new Date(field.value) : undefined}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.formState.errors.breakError && (
            <p className="text-destructive">
              {form.formState.errors.breakError.message}
            </p>
          )}
          <div className="flex gap-4 w-full">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() =>
                setEditEvent({ showOverlay: false, eventData: null })
              }
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              onClick={deleteSlot}
            >
              Delete Event
            </Button>
            <Button
              type="submit"
              className="flex-1"
              onClick={() => setIsConfirmClicked(true)}
            >
              Confirm Edit
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

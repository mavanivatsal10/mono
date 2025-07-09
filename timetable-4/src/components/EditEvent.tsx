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
import { format, parse } from "date-fns";
import { calculateSlotMinutes, isOverlaping } from "@/lib/utils";
import { useEffect, useState } from "react";
import type { slot } from "@/types/types";
import { v4 as uuidv4 } from "uuid";

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
    allSlots,
    setAllSlots,
    editEvent: { eventData: event },
    setEditEvent,
  } = useTimetable();

  const [isConfirmClicked, setIsConfirmClicked] = useState(false);

  const todayDate = format(event?.start as Date, "yyyy-MM-dd");
  const slotsToday = allSlots.find((s) => s.date === todayDate)?.slots ?? [];
  const slot = slotsToday.find((s) => s.id === event?.extendedProps.slotId);

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
    const edited: slot = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      start: data.start,
      end: data.end,
      date: format(data.date as Date, "yyyy-MM-dd"),
      type: slot?.type || "slot",
    };

    const editedSlots = slotsToday.map((s) => (s.id === slot?.id ? edited : s));
    const notOverlapping = editedSlots.filter((s) => !isOverlaping(edited, s));
    setAllSlots((prev) =>
      prev.map((s) =>
        s.date === todayDate ? { ...s, slots: [...notOverlapping, edited] } : s
      )
    );
    setEditEvent({ showOverlay: false, eventData: null });
  };

  const deleteSlot = () => {
    const deleted = slotsToday.filter(
      (slot) => slot.id !== event?.extendedProps?.slotId
    );
    setAllSlots((prev) =>
      prev.map((s) => (s.date === todayDate ? { ...s, slots: deleted } : s))
    );
    setEditEvent({ showOverlay: false, eventData: null });
  };

  // add/remove errors once confirm button is clicked
  const watchStart = form.watch("start");
  const watchEnd = form.watch("end");
  const dependency = watchStart + watchEnd;
  const breaksToday = slotsToday.filter((slot) => slot.type === "break");
  const leavesToday = slotsToday.filter((slot) => slot.type === "leave");
  const longestBreak = breaksToday.reduce((prev, curr) => {
    const prevMins = calculateSlotMinutes({
      start: prev.start,
      end: prev.end,
    });
    const currMins = calculateSlotMinutes({
      start: curr.start,
      end: curr.end,
    });
    return prevMins > currMins ? prev : curr;
  });
  const longestBreakMins = calculateSlotMinutes({
    start: longestBreak?.start,
    end: longestBreak?.end,
  });
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

import { timeSchema } from "@/schemas/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import DatePicker from "./ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useTimetable } from "@/hooks/useTimetable";
import { format } from "date-fns";
import type { slot } from "@/types/types";
import { useEffect, useState } from "react";
import { calculateSlotMinutes, isOverlaping } from "@/lib/utils";

export default function AddSlot() {
  const { allSlots, setAllSlots, isOpenAdd, setIsOpenAdd } = useTimetable();
  const [confirmTwice, setConfirmTwice] = useState(false);
  const [confirmClicked, setConfirmClicked] = useState(false);

  const formSchema = z
    .object({
      title: z.string().min(1, "Title is required"),
      description: z.string(),
      date: z.date().nullable(),
      start: timeSchema,
      end: timeSchema,
      type: z.enum(["slot", "break", "leave"]),
      isError: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.start > data.end || data.start === data.end) {
        ctx.addIssue({
          message: "End time must be after start time.",
          path: ["end"],
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.date) {
        ctx.addIssue({
          message: "Date is required.",
          path: ["date"],
          code: z.ZodIssueCode.custom,
        });
      }
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: isOpenAdd.addSlot || {
      title: "Work Slot",
      description: "",
      date: new Date(),
      start: "09:00",
      end: "10:30",
      type: "slot" as "slot" | "break" | "leave",
    },
  });

  const addSlot = (data: z.infer<typeof formSchema>) => {
    const newSlot: slot = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      start: data.start,
      end: data.end,
      date: format(data.date as Date, "yyyy-MM-dd"),
      type: data.type,
    };

    const slotsToday =
      allSlots.find((s) => s.date === newSlot.date)?.slots || [];

    if (newSlot.type === "break") {
      const breaksToday = slotsToday.filter((s) => s.type === "break");
      if (breaksToday.length >= 3) {
        form.setError("isError", {
          message: "You cannot have more than 3 breaks per day",
          type: "custom",
        });
        return;
      }

      if (calculateSlotMinutes(newSlot) > 45) {
        form.setError("isError", {
          message: "Cannot have breaks longer than 45 minutes.",
          type: "custom",
        });
        return;
      }

      const longestBreak = breaksToday.reduce(
        (prev, curr) => {
          return calculateSlotMinutes(prev) > calculateSlotMinutes(curr)
            ? prev
            : curr;
        },
        { start: "00:00", end: "00:00" }
      );
      if (
        calculateSlotMinutes(longestBreak) > 15 &&
        calculateSlotMinutes(newSlot) > 15
      ) {
        form.setError("isError", {
          message: "Cannot have more than one long breaks (> 15 minutes).",
          type: "custom",
        });
        return;
      }
    }

    if (
      slotsToday.some((s) => newSlot.id !== s.id && isOverlaping(newSlot, s))
    ) {
      if (!confirmTwice) {
        form.setError("isError", {
          message:
            "New timing is overlapping with another slot(s) or leave. Please click confirm again to update. The overlapping slots will be removed.",
          type: "custom",
        });
        setConfirmTwice(true);
        return;
      } else {
        form.clearErrors("isError");
      }
    }

    const notOverlapping = [...slotsToday, newSlot].filter((s) => {
      return !isOverlaping(newSlot, s);
    });

    setAllSlots((prev) => {
      if (prev.find((s) => s.date === newSlot.date) === undefined)
        return [...prev, { date: newSlot.date, slots: [newSlot] }];
      return prev.map((s) =>
        s.date === newSlot.date
          ? { ...s, slots: [...notOverlapping, newSlot] }
          : s
      );
    });

    setIsOpenAdd({
      open: false,
      addSchedule: null,
      addSlot: null,
      addLeave: null,
    });
  };

  const watchStart = form.watch("start");
  const watchEnd = form.watch("end");
  const watchType = form.watch("type");
  useEffect(() => {
    if (confirmClicked && watchType === "break") {
      const date = form.getValues("date");
      if (!date) return;
      const d = format(date, "yyyy-MM-dd");
      const slotsToday = allSlots.find((s) => s.date === d)?.slots || [];
      const breaksToday = slotsToday.filter((s) => s.type === "break");

      if (calculateSlotMinutes({ start: watchStart, end: watchEnd }) > 45) {
        form.setError("isError", {
          message: "Cannot have breaks longer than 45 minutes.",
          type: "custom",
        });
        return;
      }

      const longestBreak = breaksToday.reduce(
        (prev, curr) => {
          return calculateSlotMinutes(prev) > calculateSlotMinutes(curr)
            ? prev
            : curr;
        },
        { start: "00:00", end: "00:00" }
      );
      if (calculateSlotMinutes(longestBreak) > 15) {
        form.setError("isError", {
          message: "Cannot have more than one long breaks (> 15 minutes).",
          type: "custom",
        });
        return;
      }
    }
    form.clearErrors("isError");
  }, [watchStart, watchEnd, watchType]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(addSlot)}
        className="px-10 py-4 flex items-center justify-center"
      >
        <div className="flex flex-col items-center justify-center gap-4 w-full">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
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
                  <Textarea {...field} placeholder="Add a description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-4 w-full">
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
          <div className="flex gap-4 w-full">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? field.value : undefined}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a Month" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="slot">Slot</SelectItem>
                      <SelectItem value="break">Break</SelectItem>
                      <SelectItem value="leave">Leave</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {form.formState.errors.isError && (
            <p className="text-destructive">
              {form.formState.errors.isError.message}
            </p>
          )}
          <Button type="submit" onClick={() => setConfirmClicked(true)}>
            {confirmTwice ? "Confirm" : "Create Slot"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

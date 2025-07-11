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
import { useEffect, useState } from "react";
import { useTimetable } from "@/hooks/useTimetable";
import type { slot } from "@/types/types";
import { timeSchema } from "@/schemas/schemas";

export default function AddLeave({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { allSlots, setAllSlots } = useTimetable();
  const [confirmTwice, setConfirmTwice] = useState(false);

  const formSchema = z
    .object({
      date: z.date().nullable(),
      holidayType: z.enum(["full", "half", "short"]),
      halfSession: z.enum(["morning", "afternoon"]).optional(),
      start: timeSchema,
      end: timeSchema,
      isError: z.boolean().optional(),
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
    const date = format(data.date as Date, "yyyy-MM-dd");
    const slotsToday = allSlots.find((s) => s.date === date)?.slots || [];
    const sortedSlotsToday = [...slotsToday].sort((a, b) =>
      a.start < b.start ? -1 : 1
    );

    const getStartEndTimes = () => {
      if (data.holidayType === "full") {
        return [
          sortedSlotsToday[0].start,
          sortedSlotsToday[sortedSlotsToday.length - 1].end,
        ];
      } else if (data.holidayType === "half") {
        if (data.halfSession === "morning") {
          return [
            sortedSlotsToday[0].start,
            sortedSlotsToday[sortedSlotsToday.length / 2].end,
          ];
        } else {
          return [
            sortedSlotsToday[sortedSlotsToday.length / 2].start,
            sortedSlotsToday[sortedSlotsToday.length - 1].end,
          ];
        }
      } else {
        return [data.start, data.end];
      }
    };

    const [start, end] = getStartEndTimes();

    const newSlot: slot = {
      id: uuidv4(),
      title: "Leave",
      description: "",
      start,
      end,
      date,
      type: "leave",
    };

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

    setOpen(false);
  }

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
          {form.formState.errors.isError && (
            <p className="text-destructive text-sm text-center">
              {form.formState.errors.isError.message}
            </p>
          )}
          <div className="w-full flex justify-center">
            <Button type="submit" className="w-fit">
              {confirmTwice ? "Confirm" : "Add a Leave"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

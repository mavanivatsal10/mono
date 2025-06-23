import { set, useForm } from "react-hook-form";
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
import { compareTime } from "@/lib/utils";
import deepcopy from "deepcopy";

export default function UserInput({ slots, setSlots }) {
  const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  const timeSchema = z
    .string()
    .regex(timeRegex, { message: "Please enter a valid time" });

  const schema = z
    .object({
      startTime: timeSchema,
      endTime: timeSchema,
      breakStartTime: timeSchema,
      breakEndTime: timeSchema,
      slotDuration: z.string(),
    })
    .refine(
      (data) => {
        return (
          compareTime(data.startTime, "isBefore", data.endTime) ||
          compareTime(data.startTime, "isSame", data.endTime)
        );
      },
      {
        message: "End time must be on or after start time.",
        path: ["endTime"],
      }
    )
    .refine(
      (data) => {
        return (
          compareTime(data.breakStartTime, "isBefore", data.breakEndTime) ||
          compareTime(data.breakStartTime, "isSame", data.breakEndTime)
        );
      },
      {
        message: "Break end time must be on or after break start time.",
        path: ["breakEndTime"],
      }
    )
    .refine(
      (data) => {
        return (
          (compareTime(data.startTime, "isBefore", data.breakStartTime) ||
            compareTime(data.startTime, "isSame", data.breakStartTime)) &&
          (compareTime(data.breakStartTime, "isBefore", data.endTime) ||
            compareTime(data.breakStartTime, "isSame", data.endTime))
        );
      },
      {
        message: "Break start time must be between start time and end time.",
        path: ["breakStartTime"],
      }
    )
    .refine(
      (data) => {
        return (
          (compareTime(data.startTime, "isBefore", data.breakEndTime) ||
            compareTime(data.startTime, "isSame", data.breakEndTime)) &&
          (compareTime(data.breakEndTime, "isBefore", data.endTime) ||
            compareTime(data.breakEndTime, "isSame", data.endTime))
        );
      },
      {
        message: "Break end time must be between start time and end time.",
        path: ["breakEndTime"],
      }
    )
    .refine(
      (data) => {
        return Number.isInteger(Number(data.slotDuration));
      },
      {
        message: "Slot duration must be an integer",
        path: ["slotDuration"],
      }
    )
    .refine(
      (data) => {
        return Number(data.slotDuration) > 0;
      },
      {
        message: "Slot duration must be greater than 0",
        path: ["slotDuration"],
      }
    );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      startTime: "",
      endTime: "",
      breakStartTime: "",
      breakEndTime: "",
      slotDuration: "",
    },
  });

  const generateSlots = (data: any) => {
    // beforeBreak = calculate minutes between start and break start
    // afterBreak = calculate minutes between break end and end time
    // num slots = total minutes / slot duration
    // # slots before break = floor(before break minutes / slot duration)
    const getTimeNumsFromString = (time: string) =>
      time.split(":").map((t) => Number(t));
    const getTimeStringFromNums = (hour: number, minute: number) => {
      const hh = hour.toString().padStart(2, "0");
      const mm = minute.toString().padStart(2, "0");
      return `${hh}:${mm}`;
    };
    const addMinutes = (hour: number, minute: number, minutes: number) => {
      const totalMinutes = hour * 60 + minute + minutes;
      const newHour = Math.floor(totalMinutes / 60);
      const newMinute = totalMinutes % 60;
      return [newHour, newMinute];
    };

    const [startHour, startMinute] = getTimeNumsFromString(data.startTime);
    const [endHour, endMinute] = getTimeNumsFromString(data.endTime);
    const [breakStartHour, breakStartMinute] = getTimeNumsFromString(
      data.breakStartTime
    );
    const [breakEndHour, breakEndMinute] = getTimeNumsFromString(
      data.breakEndTime
    );

    const beforeBreakMinutes =
      (breakStartHour - startHour) * 60 + breakStartMinute - startMinute;
    const afterBreakMinutes =
      (endHour - breakEndHour) * 60 + endMinute - breakEndMinute;
    const slotMinutes = parseInt(data.slotDuration);

    const numSlotsBeforeBreak = Math.floor(beforeBreakMinutes / slotMinutes);
    const numSlotsAfterBreak = Math.floor(afterBreakMinutes / slotMinutes);

    let temp = deepcopy(slots);
    if (temp === null) temp = [];

    // generate slots before break
    for (let i = 0; i < numSlotsBeforeBreak; i++) {
      const [slotStartHour, slotStartMinute] = addMinutes(
        startHour,
        startMinute,
        i * slotMinutes
      );
      const [slotEndHour, slotEndMinute] = addMinutes(
        startHour,
        startMinute,
        (i + 1) * slotMinutes
      );

      const slotStartTime = getTimeStringFromNums(
        slotStartHour,
        slotStartMinute
      );
      const slotEndTime = getTimeStringFromNums(slotEndHour, slotEndMinute);
      temp.push({
        startTime: slotStartTime,
        endTime: slotEndTime,
        type: "slot",
      });
    }

    // add buffer if last slot ends before break
    if (temp[temp.length - 1].endTime !== data.breakStartTime) {
      temp.push({
        startTime: temp[temp.length - 1].endTime,
        endTime: data.breakStartTime,
        type: "buffer",
      });
    }

    // generate break
    temp.push({
      startTime: data.breakStartTime,
      endTime: data.breakEndTime,
      type: "break",
    });

    // generate slots after break
    for (let i = 0; i < numSlotsAfterBreak; i++) {
      const [slotStartHour, slotStartMinute] = addMinutes(
        breakStartHour,
        breakStartMinute,
        i * slotMinutes
      );
      const [slotEndHour, slotEndMinute] = addMinutes(
        breakStartHour,
        breakStartMinute,
        (i + 1) * slotMinutes
      );

      const slotStartTime = getTimeStringFromNums(
        slotStartHour,
        slotStartMinute
      );
      const slotEndTime = getTimeStringFromNums(slotEndHour, slotEndMinute);
      temp.push({
        startTime: slotStartTime,
        endTime: slotEndTime,
        type: "slot",
      });
    }

    // add buffer if last slot ends before day end
    if (temp[temp.length - 1].endTime !== data.endTime) {
      temp.push({
        startTime: temp[temp.length - 1].endTime,
        endTime: data.endTime,
        type: "buffer",
      });
    }

    console.log(temp);
    setSlots(temp);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(generateSlots)}
        className="p-4 flex items-center justify-center"
      >
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="flex gap-8">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="w-75">
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
                <FormItem className="w-75">
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
          <div className="flex gap-8">
            <FormField
              control={form.control}
              name="breakStartTime"
              render={({ field }) => (
                <FormItem className="w-75">
                  <FormLabel>Break Start Time</FormLabel>
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
              name="breakEndTime"
              render={({ field }) => (
                <FormItem className="w-75">
                  <FormLabel>Break End Time</FormLabel>
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
            name="slotDuration"
            render={({ field }) => (
              <FormItem className="w-75">
                <FormLabel>
                  Duration per Slot
                  <span className="font-normal">(in minutes)</span>
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
          <Button type="submit" className="w-fit">
            Generate Slots
          </Button>
        </div>
      </form>
    </Form>
  );
}

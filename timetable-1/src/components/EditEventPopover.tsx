import { useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { slot } from "@/Types/types";
import { v4 as uuidv4 } from "uuid";
import { addTime, compareTime, isOverlaping } from "@/lib/utils";
import deepcopy from "deepcopy";

export default function EditEventPopover({
  editEvent,
  setEditEvent,
  slots,
  setSlots,
}: {
  editEvent: any;
  setEditEvent: any;
  slots: slot[];
  setSlots: any;
}) {
  const popupRef = useRef<HTMLDivElement>(null);
  const editEventDetails = editEvent.eventData;

  document.body.classList.add("overflow-hidden");

  const removePopup = () => {
    setEditEvent({
      showOverlay: false,
      eventData: null,
    });
    document.body.classList.remove("overflow-hidden");
  };

  // click outside to close the popup
  useEffect(() => {
    function handleClick(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        removePopup();
      }
    }
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  const timeSchema = z
    .string()
    .regex(timeRegex, { message: "Please enter a valid time" });

  const formSchema = z
    .object({
      title: z.string(),
      description: z.string(),
      start: timeSchema,
      end: timeSchema,
    })
    .refine(
      (data) => {
        return compareTime(data.start, "isBefore", data.end);
      },
      {
        message: "End time must be after start time.",
        path: ["end"],
      }
    );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: editEventDetails.title,
      description: editEventDetails.extendedProps.description,
      start: format(editEventDetails.start, "HH:mm"),
      end: format(editEventDetails.end, "HH:mm"),
    },
  });

  const slotDate = format(editEventDetails.start, "yyyy-MM-dd");
  let slotsToday = slots.filter((e) => e.date === slotDate);

  const defaultSlots = slots.filter((s) => s.date === "default");
  if (slotsToday.length === 0) {
    slotsToday = defaultSlots.map((e) => {
      return { ...e, id: `${e.id}-${slotDate}`, date: slotDate };
    });
  }

  const breakToday =
    slotsToday.find((slot) => slot.type === "break") ||
    defaultSlots.find((slot) => slot.type === "break");

  const currentSlot = slotsToday.find((slot) =>
    slot.id.includes(editEventDetails.extendedProps.slotId)
  );

  const tempSortedDefaultSlots = defaultSlots.sort((a, b) => {
    return compareTime(a.start, "isBefore", b.start) ? -1 : 1;
  });
  const defaultDayStart = tempSortedDefaultSlots[0]?.start;
  const defaultDayEnd =
    tempSortedDefaultSlots[tempSortedDefaultSlots.length - 1]?.end;
  //const defaultBreak = defaultSlots.find((slot) => slot.type === "break");

  const updatedStartTime = form.watch("start");
  const updatedEndTime = form.watch("end");

  // helper functions
  // if buffer is larger than work slot time, replace with slot(s) and buffer
  const editLongBuffer = (slotAfter: slot) => {
    /**
     * calculate slot duration (max freq of slot durations) if slots available else take default slot duration
     * if slotsToday has break available, take that break time else take default break time
     * go through the sorted slots. if the current slot is buffer and buffer size > working slot size:
     *  - remove the buffer slot
     *  - add slot(s) based on buffer size
     *  - add buffer if last slot end time < break start time
     *  - add break if last slot/buffer end time is break start time
     *  - add slot(s) if break added and slotAfter.start is after break end and remaining buffer size > working slot size
     *  - add buffer if last slot end time is before dayEnd
     */

    const calculateSlotDuration = (slot: slot): number => {
      const hstart = Number(slot.start.split(":")[0]);
      const mstart = Number(slot.start.split(":")[1]);
      const hend = Number(slot.end.split(":")[0]);
      const mend = Number(slot.end.split(":")[1]);
      return (hend - hstart) * 60 + (mend - mstart);
    };

    const getSlotDuration = (slots: slot[]) => {
      if (slots.length === 0) return 60;
      const slotDurations = slots.map((slot) => calculateSlotDuration(slot));

      let res = 0;
      const freq = slotDurations.reduce((acc, duration) => {
        if (acc[duration]) {
          acc[duration]++;
        } else {
          acc[duration] = 1;
        }
        return acc;
      }, {});

      for (const duration in freq) {
        if (freq[duration] > res) {
          res = duration;
        }
      }
      return res;
    };
    const slotDuration = getSlotDuration(
      slotsToday.filter((slot) => slot.type === "slot")
    );

    const tempSlots = deepcopy(slotsToday);
    for (const slot of tempSlots) {
      const bufferTime = calculateSlotDuration(slot);
      if (slot.type === "buffer" && bufferTime > slotDuration) {
        // add slots
        for (let i = 0; i < Math.floor(bufferTime / slotDuration); i++) {
          slotsToday = slotsToday.filter((s) => s.id !== slot.id);
          slotsToday.push({
            id: uuidv4(),
            date: slotDate,
            type: "slot",
            start: addTime(slot.start, slotDuration * i),
            end: addTime(slot.start, slotDuration * (i + 1)),
            title: "Work Slot",
            description: "",
          });
        }

        // // add buffer
        // if (
        //   compareTime(
        //     slotsToday[slotsToday.length - 1].end,
        //     "isBefore",
        //     breakToday?.start
        //   )
        // ) {
        //   slotsToday.push({
        //     id: uuidv4(),
        //     date: slotDate,
        //     type: "buffer",
        //     start: slotsToday[slotsToday.length - 1].end,
        //     end: breakToday?.start,
        //     title: "Buffer",
        //     description: "",
        //   });
        // }
        // // add break
        // if (
        //   compareTime(
        //     slotsToday[slotsToday.length - 1].end,
        //     "isSame",
        //     breakToday.start
        //   )
        // ) {
        //   slotsToday.push({
        //     id: uuidv4(),
        //     date: slotDate,
        //     type: "break",
        //     start: breakToday.start,
        //     end: breakToday.end,
        //     title: "Break",
        //     description: "",
        //   });
        // }
        // // add slots
        // const remainingTime =
        //   bufferTime -
        //   (Math.floor(bufferTime / slotDuration) + 2) * slotDuration;
        // if (
        //   slotsToday[slotsToday.length - 1].type === "break" &&
        //   compareTime(
        //     slotAfter.start,
        //     "isAfter",
        //     slotsToday[slotsToday.length - 1].end
        //   ) &&
        //   remainingTime > slotDuration
        // ) {
        //   for (let i = 0; i < Math.floor(remainingTime / slotDuration); i++) {
        //     slotsToday.push({
        //       id: uuidv4(),
        //       date: slotDate,
        //       type: "slot",
        //       start: addTime(breakToday.end, slotDuration * i),
        //       end: addTime(breakToday.end, slotDuration * (i + 1)),
        //       title: "Work Slot",
        //       description: "",
        //     });
        //   }
        // }
        // // add buffer
        // if (
        //   compareTime(
        //     slotsToday[slotsToday.length - 1].end,
        //     "isBefore",
        //     defaultDayEnd
        //   )
        // ) {
        //   slotsToday.push({
        //     id: uuidv4(),
        //     date: slotDate,
        //     type: "buffer",
        //     start: slotsToday[slotsToday.length - 1].end,
        //     end: defaultDayEnd,
        //     title: "Buffer",
        //     description: "",
        //   });
        // }
      }
    }
    const filteredSlots = slots.filter((s) => s.date !== slotDate);
    const updatedSlots = filteredSlots.concat(slotsToday);

    setSlots(updatedSlots);
  };

  const editWorkSlot = () => {
    /**
     * find all the slots on that day
     *  - if there are no slots available on that date, it means that it uses default slots
     *  - in this case, make a copy of all the default slots with date = this date, id = `${id}-${date}`
     * find the event whose id matches the editEventDetails.id (id of the popup/current event) and change its title and description OR filter it
     * filter all the slots on that day and push the updated slots
     */

    currentSlot.title = form.getValues("title");
    currentSlot.description = form.getValues("description");

    for (const slot of slotsToday) {
      if (
        isOverlaping(
          { start: slot.start, end: slot.end },
          { start: updatedStartTime, end: updatedEndTime }
        ) &&
        slot.type === "slot" &&
        slot.id !== currentSlot.id
      ) {
        form.setError("root", {
          message: "The new timing is overlapping with another working slot",
          type: "manual",
        });
        return;
      } else if (
        isOverlaping(
          { start: slot.start, end: slot.end },
          { start: updatedStartTime, end: updatedEndTime }
        ) &&
        slot.type === "leave" &&
        slot.id !== currentSlot.id
      ) {
        form.setError("root", {
          message: "The new timing is overlapping with your leave",
          type: "manual",
        });
        return;
      }
    }

    currentSlot.start = updatedStartTime;
    currentSlot.end = updatedEndTime;

    slotsToday = slotsToday.filter((e) => e.id !== currentSlot.id);
    slotsToday.push(currentSlot);

    // add buffer if edited time is leaving time before/after neighboring slots
    const sortedSlotsToday = slotsToday.sort((a, b) =>
      compareTime(a.start, "isBefore", b.start) ? -1 : 1
    );

    let slotBefore, slotAfter;
    for (let i = 0; i < sortedSlotsToday.length; i++) {
      const slot = sortedSlotsToday[i];
      if (slot.id === currentSlot.id) {
        slotBefore = i > 0 ? sortedSlotsToday[i - 1] : null;
        slotAfter =
          i < sortedSlotsToday.length - 1 ? sortedSlotsToday[i + 1] : null;
      }
    }

    if (
      slotBefore !== null &&
      compareTime(slotBefore.end, "isBefore", currentSlot.start)
    ) {
      slotsToday.push({
        id: uuidv4(),
        date: slotDate,
        start: slotBefore.end,
        end: currentSlot.start,
        title: "Buffer",
        description: "",
        type: "buffer",
      });
    }

    if (
      slotAfter !== null &&
      compareTime(currentSlot.end, "isBefore", slotAfter.start)
    ) {
      slotsToday.push({
        id: uuidv4(),
        date: slotDate,
        start: currentSlot.end,
        end: slotAfter.start,
        title: "Buffer",
        description: "",
        type: "buffer",
      });
    }

    const filteredSlots = slots.filter((s) => s.date !== slotDate);
    const updatedSlots = filteredSlots.concat(slotsToday);

    setSlots(updatedSlots);
    removePopup();
  };

  const editBreakOrBuffer = () => {
    currentSlot.title = form.getValues("title");
    currentSlot.description = form.getValues("description");

    if (
      currentSlot?.start !== updatedStartTime ||
      currentSlot.end !== updatedEndTime
    ) {
      form.setError("root", {
        message: `Timing of ${currentSlot.type} cannot be changed`,
        type: "manual",
      });
      return;
    }

    const filteredSlots = slots.filter((s) => s.date !== slotDate);
    const updatedSlots = filteredSlots.concat(slotsToday);

    setSlots(updatedSlots);
    removePopup();
  };

  const editLeave = () => {
    currentSlot.title = form.getValues("title");
    currentSlot.description = form.getValues("description");

    for (const slot of slotsToday) {
      if (
        isOverlaping(
          { start: slot.start, end: slot.end },
          { start: updatedStartTime, end: updatedEndTime }
        ) &&
        slot.type === "leave" &&
        slot.id !== currentSlot.id
      ) {
        form.setError("root", {
          message: "The new timing is overlapping with another leave",
          type: "manual",
        });
        return;
      }
    }

    // if (
    //   slotsToday.find((s) => s.type === "break") === undefined &&
    //   (compareTime(updatedEndTime, "isBefore", breakToday.start) ||
    //     compareTime(updatedStartTime, "isAfter", breakToday.end))
    // ) {
    //   slotsToday.push({
    //     id: uuidv4(),
    //     date: slotDate,
    //     start: breakToday.start,
    //     end: breakToday.end,
    //     title: "Break",
    //     description: "",
    //     type: "break",
    //   });
    // }

    currentSlot.start = updatedStartTime;
    currentSlot.end = updatedEndTime;

    slotsToday = slotsToday.filter(
      (slot) =>
        !isOverlaping(
          { start: slot.start, end: slot.end },
          { start: updatedStartTime, end: updatedEndTime }
        )
    );
    slotsToday.push(currentSlot);

    const filteredSlots = slots.filter((s) => s.date !== slotDate);
    slotsToday = filteredSlots.concat(slotsToday);

    const leaveSlot = slotsToday.find((s) => s.type === "leave");
    const breakSlot = slotsToday.find((s) => s.type === "break");

    const isLeaveBeforeBreak =
      leaveSlot !== undefined &&
      breakSlot !== undefined &&
      compareTime(leaveSlot.end, "isBefore", breakSlot.start);
    const isLeaveAfterBreak =
      leaveSlot !== undefined &&
      breakSlot !== undefined &&
      compareTime(leaveSlot.start, "isAfter", breakSlot.end);
    const isLeaveConsumeBreak =
      leaveSlot !== undefined && breakSlot === undefined;

    if (isLeaveBeforeBreak) {
    }

    setSlots(slotsToday);
    removePopup();
  };

  const editSlot = () => {
    if (currentSlot?.type === "slot") {
      editWorkSlot();
    } else if (
      currentSlot?.type === "buffer" ||
      currentSlot?.type === "break"
    ) {
      editBreakOrBuffer();
    } else if (currentSlot?.type === "leave") {
      editLeave();
    }
  };

  const deleteSlot = () => {
    slotsToday = slotsToday.filter(
      (slot) => !slot.id.includes(editEventDetails.extendedProps.slotId)
    );

    if (slotsToday.length === 0) {
      slotsToday.push({
        id: uuidv4(),
        date: slotDate,
        start: "00:00",
        end: "00:00",
        title: "",
        description: "",
        type: "no-events",
      });
    }
    const filteredSlots = slots.filter((s) => s.date !== slotDate);
    const updatedSlots = filteredSlots.concat(slotsToday);

    setSlots(updatedSlots);
    removePopup();
  };

  useEffect(() => {
    // remove time overlap error if new time is valid
    for (const slot of slotsToday) {
      if (
        isOverlaping(
          { start: slot.start, end: slot.end },
          { start: updatedStartTime, end: updatedEndTime }
        ) &&
        slot.type === "slot" &&
        slot.id !== currentSlot.id
      ) {
        return;
      } else if (
        isOverlaping(
          { start: slot.start, end: slot.end },
          { start: updatedStartTime, end: updatedEndTime }
        ) &&
        slot.type === "leave" &&
        slot.id !== currentSlot.id
      ) {
        return;
      }
    }

    // remove buffer/break time cannot be changed error
    if (
      currentSlot.start !== updatedStartTime ||
      currentSlot.end !== updatedEndTime
    ) {
      return;
    }

    form.clearErrors("root");
  }, [updatedStartTime, updatedEndTime]);

  return (
    <div>
      <div
        style={{ zIndex: 10000 }}
        className="fixed top-0 left-0 right-0 bottom-0 z-40 bg-black opacity-50"
      ></div>
      <div
        ref={popupRef}
        style={{ zIndex: 10001 }}
        className="flex flex-col gap-4 w-100 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-md"
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(editSlot)}
            className="p-4 flex items-center justify-center"
          >
            <div className="flex flex-col items-center justify-center gap-4 w-full">
              <div className="flex justify-between items-center w-full gap-4">
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
                <div onClick={removePopup}>
                  <X />
                </div>
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Add a description"
                        className="max-h-50 overflow-auto"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="start"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Start Time: </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>End Time: </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.formState.errors.root && (
                <p className="text-red-500">
                  {form.formState.errors.root.message}
                </p>
              )}
              <div className="flex gap-4 w-full">
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  onClick={deleteSlot}
                >
                  Delete Event
                </Button>
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

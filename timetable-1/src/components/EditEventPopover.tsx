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
import { compareTime, isOverlaping } from "@/lib/utils";

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

  if (slotsToday.length === 0) {
    const defaultSlots = slots.filter((s) => s.date === "default");

    slotsToday = defaultSlots.map((e) => {
      return { ...e, id: `${e.id}-${slotDate}`, date: slotDate };
    });
  }

  const tempSortedSlotsToday = slotsToday.sort((a, b) => {
    return compareTime(a.start, "isBefore", b.start) ? -1 : 1;
  });
  const dayStart = tempSortedSlotsToday[0]?.start;
  const dayEnd = tempSortedSlotsToday[tempSortedSlotsToday.length - 1]?.end;

  const editSlot = () => {
    /**
     * find all the slots on that day
     *  - if there are no slots available on that date, it means that it uses default slots
     *  - in this case, make a copy of all the default slots with date = this date, id = `${id}-${date}`
     * find the event whose id matches the editEventDetails.id and change its title and description OR filter it
     * filter all the slots on that day and push the updated slots
     */

    const updatedSlot = slotsToday.find((slot) =>
      slot.id.includes(editEventDetails.extendedProps.slotId)
    );
    updatedSlot.title = form.getValues("title");
    updatedSlot.description = form.getValues("description");

    const updatedStartTime = form.getValues("start");
    const updatedEndTime = form.getValues("end");

    for (const slot of slotsToday) {
      if (
        isOverlaping(
          { start: slot.start, end: slot.end },
          { start: updatedStartTime, end: updatedEndTime }
        ) &&
        slot.type === "slot" &&
        slot.id !== updatedSlot.id
      ) {
        form.setError("root", {
          message: "The new timing is overlapping with another slot",
          type: "manual",
        });
        return;
      }
    }

    updatedSlot.start = updatedStartTime;
    updatedSlot.end = updatedEndTime;

    slotsToday = slotsToday.filter((e) => e.id !== updatedSlot.id);
    slotsToday.push(updatedSlot);

    // add buffer if edited time is leaving time before/after neighboring slots
    const sortedSlotsToday = slotsToday.sort((a, b) =>
      compareTime(a.start, "isBefore", b.start) ? -1 : 1
    );

    let slotBefore, slotAfter;
    for (let i = 0; i < sortedSlotsToday.length; i++) {
      const slot = sortedSlotsToday[i];
      if (slot.id === updatedSlot.id) {
        slotBefore = i > 0 ? sortedSlotsToday[i - 1] : null;
        slotAfter =
          i < sortedSlotsToday.length - 1 ? sortedSlotsToday[i + 1] : null;
      }
    }

    if (
      slotBefore !== null &&
      compareTime(slotBefore.end, "isBefore", updatedSlot.start)
    ) {
      slotsToday.push({
        id: uuidv4(),
        date: slotDate,
        start: slotBefore.end,
        end: updatedSlot.start,
        title: "Buffer",
        description: "",
        type: "buffer",
      });
    }

    if (
      slotAfter !== null &&
      compareTime(updatedSlot.end, "isBefore", slotAfter.start)
    ) {
      slotsToday.push({
        id: uuidv4(),
        date: slotDate,
        start: updatedSlot.end,
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

  // remove time overlap error if new time is valid
  const start = form.watch("start");
  const end = form.watch("end");
  useEffect(() => {
    const currentSlot = slotsToday.find((slot) =>
      slot.id.includes(editEventDetails.extendedProps.slotId)
    );
    for (const slot of slotsToday) {
      if (
        isOverlaping(
          { start: slot.start, end: slot.end },
          { start: start, end: end }
        ) &&
        slot.type === "slot" &&
        slot.id !== currentSlot.id
      ) {
        return;
      }
    }
    form.clearErrors("root");
  }, [start, end]);

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

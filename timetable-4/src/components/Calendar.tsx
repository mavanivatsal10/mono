import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { v4 as uuidv4 } from "uuid";
import "../index.css";
import { useEffect, useRef } from "react";
import { useTimetable } from "@/hooks/useTimetable";
import type {
  EventClickArg,
  EventDropArg,
  EventInput,
  EventSourceFuncArg,
} from "@fullcalendar/core/index.js";
import { format } from "date-fns";
import EditEvent from "./EditEvent";
import { toast } from "sonner";
import type { slot } from "@/types/types";
import { calculateSlotMinutes } from "@/lib/utils";

export default function Calendar() {
  const { allSlots, setAllSlots, editEvent, setEditEvent } = useTimetable();

  const getSlotColor = (type: string) => {
    if (type === "slot") return "#118ab2";
    else if (type === "buffer") return "#06d6a0";
    else if (type === "break") return "#ffd166";
    else if (type === "leave") return "red";
  };

  const getEvents = (info: EventSourceFuncArg) => {
    const start = info.start;
    const end = info.end;
    const generated: EventInput[] = [];

    const getEventsForDate = (date: Date) => {
      const d = format(date, "yyyy-MM-dd");
      const todaySlots = allSlots.find((s) => s.date === d)?.slots ?? [];

      return todaySlots.map((slot) => {
        return {
          id: uuidv4(),
          title: slot.title,
          start: `${d}T${slot.start}:00`,
          end: `${d}T${slot.end}:00`,
          color: getSlotColor(slot.type),
          extendedProps: {
            type: slot.type,
            description: slot.description,
            slotId: slot.id,
          },
        };
      });
    };

    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      generated.push(...getEventsForDate(date));
    }
    return generated;
  };

  const handleEventClick = (arg: EventClickArg) => {
    arg.jsEvent.stopPropagation();

    if (arg.event._def.extendedProps.type === "buffer") {
      toast("Cannot edit buffer slots");
      return;
    }

    setEditEvent({
      showOverlay: true,
      eventData: arg.event,
    });
  };

  const handleEventDrop = (eventDropInfo: EventDropArg) => {
    const newEvent = eventDropInfo.event;
    const newDate = format(newEvent.start as Date, "yyyy-MM-dd");
    const oldEvent = eventDropInfo.oldEvent;
    const oldDate = format(oldEvent.start as Date, "yyyy-MM-dd");

    if (newEvent._def.extendedProps.type === "buffer") {
      toast("Cannot move buffer slots");
      eventDropInfo.revert();
      return;
    }

    if (newEvent._def.extendedProps.type === "break") {
      const newDateAllSlots =
        allSlots.find((s) => s.date === newDate)?.slots ?? [];
      const newDateBreaks = newDateAllSlots.filter((s) => s.type === "break");

      if (newDateBreaks.length >= 3) {
        toast("Cannot have more than 3 breaks per day.");
        eventDropInfo.revert();
        return;
      }

      const newDateLongestBreak = newDateBreaks.reduce(
        (a, b) => {
          const aMinutes = calculateSlotMinutes(a);
          const bMinutes = calculateSlotMinutes(b);
          return aMinutes > bMinutes ? a : b;
        },
        { start: "00:00", end: "00:00" }
      );

      const newDateLongestBreakMinutes =
        calculateSlotMinutes(newDateLongestBreak);
      const newEventMinutes = calculateSlotMinutes({
        start: format(newEvent.start as Date, "HH:mm"),
        end: format(newEvent.end as Date, "HH:mm"),
      });

      if (newDateLongestBreakMinutes > 15 && newEventMinutes > 15) {
        toast("Only one long break (> 15 minutes) is allowed per day.");
        eventDropInfo.revert();
        return;
      }
    }

    const newSlot: slot = {
      id: uuidv4(),
      title: newEvent.title,
      description: newEvent._def.extendedProps.description,
      start: format(newEvent.start as Date, "HH:mm"),
      end: format(newEvent.end as Date, "HH:mm"),
      date: newDate,
      type: newEvent._def.extendedProps.type,
    };

    setAllSlots(() => {
      // remove old slot
      const newSlots = allSlots.map((s) => {
        if (s.date === oldDate) {
          return {
            ...s,
            slots: s.slots.filter(
              (slot) => slot.id !== oldEvent._def.extendedProps.slotId
            ),
          };
        } else {
          return s;
        }
      });
      // add new slot
      return newSlots.map((s) => {
        if (s.date === newDate) {
          return {
            ...s,
            slots: [...s.slots, newSlot],
          };
        } else {
          return s;
        }
      });
    });
  };

  // adjust popover position if it goes out of the viewport
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const popoverEl = document.querySelector(".fc-popover");

      if (popoverEl) {
        const rect = popoverEl.getBoundingClientRect();

        if (rect.bottom > window.innerHeight) {
          const newTop = rect.top - rect.height - 10;
          popoverEl.style.top = `${newTop}px`;
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  // Re-fetch events when slots change
  const calendarRef = useRef<FullCalendar | null>(null);
  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current?.getApi().refetchEvents();
    }
  }, [allSlots]);

  return (
    <div>
      <div className="flex-1 p-8">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={(info, onSuccess) => {
            const events = getEvents(info);
            onSuccess(events);
          }}
          eventClick={handleEventClick}
          height={window.innerHeight - 120}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          dayMaxEvents={true}
          nowIndicator={true}
          // discard extra cells
          fixedWeekCount={false}
          showNonCurrentDates={false}
          // in dayGridView, only show from 8am to 8pm with 15 min gap
          slotDuration="00:15:00"
          // slotMinTime="08:00:00"
          // slotMaxTime="20:00:00"
          // drag and drop features
          editable={true}
          eventDrop={handleEventDrop}
          eventDurationEditable={false}
        />
      </div>
      {editEvent.showOverlay && <EditEvent />}
    </div>
  );
}

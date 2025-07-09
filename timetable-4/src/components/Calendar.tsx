import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { v4 as uuidv4 } from "uuid";
import "../index.css";
import { useEffect, useRef } from "react";
import { useTimetable } from "@/hooks/useTimetable";
import type {
  EventClickArg,
  EventInput,
  EventSourceFuncArg,
} from "@fullcalendar/core/index.js";
import { format } from "date-fns";
import { isOverlaping } from "@/lib/utils";
import EditEvent from "./EditEvent";
import { toast } from "sonner";

export default function Calendar() {
  const { allSlots, editEvent, setEditEvent } = useTimetable();

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
          plugins={[dayGridPlugin, timeGridPlugin]}
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
          views={{
            dayGridMonth: {
              dayMaxEventRows: 3,
            },
          }}
          nowIndicator={true}
          // discard extra cells
          fixedWeekCount={false}
          showNonCurrentDates={false}
          // in dayGridView, only show from 8am to 8pm with 15 min gap
          slotDuration="00:15:00"
          // slotMinTime="08:00:00"
          // slotMaxTime="20:00:00"
        />
      </div>
      {editEvent.showOverlay && <EditEvent />}
    </div>
  );
}

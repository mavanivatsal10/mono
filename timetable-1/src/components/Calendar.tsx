import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { v4 as uuidv4 } from "uuid";
import "../index.css";
import { useEffect } from "react";
import { format } from "date-fns";

export default function Calendar({ slots, setEditEvent, calendarRef }) {
  // Helper: Get dates with specific events
  const getSpecificDates = (eventList) => {
    return new Set(
      eventList.filter((e) => e.date !== "default").map((e) => e.date)
    );
  };

  const getEvents = (info) => {
    /**
     * generate a list of dates for which there are slots defined
     * for each date in the visible range (info.start, info.end),
     *     if there are events on that date, then push them
     *     else push the default events
     */

    if (slots === null) {
      return [];
    }

    const start = info.start;
    const end = info.end;
    const specificDates = getSpecificDates(slots);

    const generated = [];

    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const dateStr = format(date, "yyyy-MM-dd");

      if (specificDates.has(dateStr)) {
        const eventsToday = slots.filter((s) => s.date === dateStr);
        const eventList = eventsToday.map((e) => {
          return {
            id: uuidv4(),
            title: e.title,
            start: new Date(`${dateStr}T${e.start}:00`),
            end: new Date(`${dateStr}T${e.end}:00`),
            extendedProps: {
              description: e.description,
              slotId: e.id,
            },
          };
        });

        generated.push(...eventList);
      } else {
        const defaultEvents = slots.filter((slot) => slot.date === "default");
        const eventList = defaultEvents.map((e) => {
          return {
            id: uuidv4(),
            title: e.title,
            start: new Date(`${dateStr}T${e.start}:00`),
            end: new Date(`${dateStr}T${e.end}:00`),
            extendedProps: {
              description: e.description,
              slotId: e.id,
            },
          };
        });
        generated.push(...eventList);
      }
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

  const handleEventClick = (info) => {
    info.jsEvent.stopPropagation();
    setEditEvent({
      showOverlay: true,
      eventData: info.event,
    });
  };

  return (
    <div>
      <div className="w-200">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          events={(info, onSuccess) => {
            const events = getEvents(info);
            onSuccess(events);
          }}
          eventClick={handleEventClick}
          height={window.innerHeight - 90}
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
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
        />
      </div>
    </div>
  );
}

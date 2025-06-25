import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { v4 as uuidv4 } from "uuid";
import "../index.css";

export default function Calendar({ slots }) {
  const transformSlotsToEvents = (slot) => {
    const event = {
      id: uuidv4(),
      title: slot.title,
      color:
        slot.type === "slot"
          ? "var(--chart-2)"
          : slot.type === "break"
          ? "var(--chart-1)"
          : "var(--chart-4)",
      extendedProps: {
        type: slot.type,
        description: slot.description,
        date: slot.date,
      },
    };
    if (slot.startTime) {
      return {
        ...event,
        startTime: slot.startTime,
        endTime: slot.endTime,
      };
    } else {
      return {
        ...event,
        start: slot.start,
        end: slot.end,
      };
    }
  };

  return (
    <div>
      <div className="w-200">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          events={slots}
          eventDataTransform={transformSlotsToEvents}
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

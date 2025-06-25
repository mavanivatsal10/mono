import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { v4 as uuidv4 } from "uuid";
import "../index.css";

export default function Calendar({ slots }) {
  const transformSlotsToEvents = (slot) => {
    return {
      id: uuidv4(),
      title: slot.title,
      startTime: slot.startTime,
      endTime: slot.endTime,
      color:
        slot.type === "slot"
          ? "var(--chart-2)"
          : slot.type === "break"
          ? "var(--chart-1)"
          : "var(--chart-4)",
    };
  };

  return (
    <div>
      <div className="w-200">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          events={slots}
          eventDataTransform={transformSlotsToEvents}
          height={window.innerHeight - 100}
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
          fixedWeekCount={false}
          showNonCurrentDates={false}
        />
      </div>
    </div>
  );
}

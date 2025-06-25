import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { v4 as uuidv4 } from "uuid";

export default function Calendar({ slots }) {
  const transformSlotsToEvents = (slot) => {
    return {
      id: uuidv4(),
      title: slot.title,
      startTime: slot.startTime,
      endTime: slot.endTime,
      backgroundColor:
        slot.type === "slot" ? "blue" : slot.type === "break" ? "green" : "red",
    };
  };

  return (
    <div>
      <h1>Demo App</h1>
      <div className="w-200">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          events={slots}
          eventDataTransform={transformSlotsToEvents}
          eventContent={renderEventContent}
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
        />
      </div>
    </div>
  );
}

// a custom render function
function renderEventContent(eventInfo) {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
    </>
  );
}

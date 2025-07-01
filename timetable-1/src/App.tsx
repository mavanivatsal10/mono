import { useEffect, useRef, useState } from "react";
import UserInput from "./components/UserInput";
import Calendar from "./components/Calendar";
import EditEventPopover from "./components/EditEventPopover";

export default function App() {
  const [slots, setSlots] = useState(null);
  const [editEvent, setEditEvent] = useState({
    showOverlay: false,
    eventData: null,
  });

  const calendarRef = useRef(null);

  // Re-fetch events when slots change
  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current?.getApi().refetchEvents();
    }
  }, [slots]);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-gray-100 gap-8 lg:p-0 p-8">
      <div className="bg-white p-4 rounded-lg shadow-md h-fit w-fit">
        <UserInput setSlots={setSlots} slots={slots} />
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md h-fit w-fit">
        <Calendar
          slots={slots}
          setEditEvent={setEditEvent}
          calendarRef={calendarRef}
        />
      </div>
      {editEvent.showOverlay && (
        <EditEventPopover
          editEvent={editEvent}
          setEditEvent={setEditEvent}
          slots={slots}
          setSlots={setSlots}
        />
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "./ui/button";

export default function EditEventPopover({
  editEvent,
  setEditEvent,
  slots,
  setSlots,
}) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [editEventDetails, setEditEventDetails] = useState(editEvent.eventData);

  useEffect(() => {
    function handleClick(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setEditEvent({
          showOverlay: false,
          eventData: null,
        });
      }
    }
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const formatCustomDate = (date) => {
    // Helper to add ordinal suffix to a day
    const getOrdinal = (day) => {
      if (day > 3 && day < 21) return `${day}th`;
      const suffixes = { 1: "st", 2: "nd", 3: "rd" };
      const suffix = suffixes[day % 10] || "th";
      return `${day}${suffix}`;
    };

    const time = format(date, "hh:mm a"); // 01:45 PM
    const day = getOrdinal(date.getDate()); // 25th
    const month = format(date, "LLLL"); // July
    const year = format(date, "yyyy"); // 2025

    return `${time} - ${day} ${month}, ${year}`;
  };

  const saveEditEvent = () => {
    /**
     * find all the events on that day
     *  - if there are no events available on that date, it means that it uses default events
     *  - in this case, make a copy of all the default events with date = this date
     * map all of this date's events to new title and description
     * push the new events to slots
     */
    setEditEvent({
      showOverlay: false,
      eventData: null,
    });
  };

  return (
    <div>
      <div
        style={{ zIndex: 10000 }}
        className="fixed top-0 left-0 right-0 bottom-0 z-40 bg-black opacity-50"
      ></div>
      <div
        ref={popupRef}
        style={{ zIndex: 10001 }}
        className="flex flex-col gap-4 w-100 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-md"
      >
        <div className="flex justify-between items-center gap-4">
          <Input
            type="text"
            value={editEventDetails.title}
            onChange={(e) =>
              setEditEventDetails({
                ...editEventDetails,
                title: e.target.value,
              })
            }
            placeholder="Title"
          />
          <div
            onClick={() =>
              setEditEvent({ showOverlay: false, eventData: null })
            }
          >
            <X />
          </div>
        </div>
        <Textarea
          value={editEventDetails.description}
          onChange={(e) =>
            setEditEventDetails({
              ...editEventDetails,
              description: e.target.value,
            })
          }
          placeholder="Description"
        />
        {/* <div>
          <span>Start Time: </span>
          <span className="text-sm">
            {formatCustomDate(editEventDetails.start)}
          </span>
        </div>
        <div>
          <span>End Time: </span>
          <span className="text-sm">
            {formatCustomDate(editEventDetails.end)}
          </span>
        </div> */}
        <Button onClick={saveEditEvent}>Save</Button>
      </div>
    </div>
  );
}

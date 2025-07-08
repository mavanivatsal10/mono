import { useState } from "react";
import { TimetableContext } from "./TimetableContext";
import type { slot } from "@/types/types";
import type { EventImpl } from "@fullcalendar/core/internal";
import { format } from "date-fns";

export const TimetableProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [slots, setSlots] = useState<slot[]>([
    // {
    //   id: "yesterday",
    //   title: "yesterday",
    //   description: "yesterday",
    //   start: "09:30",
    //   end: "10:30",
    //   date: format(
    //     new Date(new Date().setDate(new Date().getDate() - 1)),
    //     "yyyy-MM-dd"
    //   ),
    //   type: "slot",
    // },
    // {
    //   id: "tomorrow",
    //   title: "tomorrow",
    //   description: "tomorrow",
    //   start: "15:00",
    //   end: "16:30",
    //   date: format(
    //     new Date(new Date().setDate(new Date().getDate() + 1)),
    //     "yyyy-MM-dd"
    //   ),
    //   type: "slot",
    // },
    // {
    //   id: "today",
    //   title: "today",
    //   description: "today",
    //   start: "11:15",
    //   end: "13:45",
    //   date: format(new Date(), "yyyy-MM-dd"),
    //   type: "slot",
    // },
    // {
    //   id: "no-events",
    //   title: "no-events",
    //   description: "no-events",
    //   start: "10:30",
    //   end: "11:30",
    //   date: format(new Date(), "yyyy-MM-dd"),
    //   type: "no-events",
    // },
  ]);
  const [specificDates, setSpecificDates] = useState<Set<string>>(new Set());
  const [editEvent, setEditEvent] = useState<{
    showOverlay: boolean;
    eventData: EventImpl | null;
  }>({
    showOverlay: false,
    eventData: null,
  });

  return (
    <TimetableContext.Provider
      value={{
        slots,
        setSlots,
        specificDates,
        setSpecificDates,
        editEvent,
        setEditEvent,
      }}
    >
      {children}
    </TimetableContext.Provider>
  );
};

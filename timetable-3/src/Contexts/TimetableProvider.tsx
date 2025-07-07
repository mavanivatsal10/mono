import { useState } from "react";
import { TimetableContext } from "./TimetableContext";
import type { slot } from "@/types/types";
import type { EventImpl } from "@fullcalendar/core/internal";

export const TimetableProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [slots, setSlots] = useState<slot[]>([
    {
      id: "yes",
      title: "yesterday slot",
      description: "yesterday slot description",
      start: "09:30",
      end: "10:30",
      date: "2025-07-06",
      type: "slot",
    },
    {
      id: "to",
      title: "today slot",
      description: "today slot description",
      start: "15:30",
      end: "17:00",
      date: "2025-07-07",
      type: "slot",
    },
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

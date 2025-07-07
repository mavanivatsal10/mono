import { useState } from "react";
import { TimetableContext } from "./TimetableContext";
import type { slot } from "@/types/types";
import type { EventImpl } from "@fullcalendar/core/internal";

export const TimetableProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [slots, setSlots] = useState<slot[]>([]);
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

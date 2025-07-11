import { useState } from "react";
import { TimetableContext } from "./TimetableContext";
import type { slot } from "@/types/types";
import type { EventImpl } from "@fullcalendar/core/internal";

export const TimetableProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [allSlots, setAllSlots] = useState<
    {
      date: string;
      slots: slot[];
    }[]
  >([]);
  const [editEvent, setEditEvent] = useState<{
    showOverlay: boolean;
    eventData: EventImpl | null;
  }>({
    showOverlay: false,
    eventData: null,
  });
  const [isOpenAdd, setIsOpenAdd] = useState({
    open: false,
    addSchedule: null,
    addSlot: null,
    addLeave: null,
  });

  return (
    <TimetableContext.Provider
      value={{
        allSlots,
        setAllSlots,
        editEvent,
        setEditEvent,
        isOpenAdd,
        setIsOpenAdd,
      }}
    >
      {children}
    </TimetableContext.Provider>
  );
};

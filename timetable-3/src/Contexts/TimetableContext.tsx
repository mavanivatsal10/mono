import type { slot } from "@/types/types";
import type { EventImpl } from "@fullcalendar/core/internal";
import { createContext } from "react";

type TimetableContextType = {
  slots: slot[];
  setSlots: React.Dispatch<React.SetStateAction<slot[]>>;
  specificDates: Set<string>;
  setSpecificDates: React.Dispatch<React.SetStateAction<Set<string>>>;
  editEvent: { showOverlay: boolean; eventData: EventImpl | null };
  setEditEvent: React.Dispatch<
    React.SetStateAction<{ showOverlay: boolean; eventData: EventImpl | null }>
  >;
};

export const TimetableContext = createContext<TimetableContextType | null>(
  null
);

import type { slot } from "@/types/types";
import type { EventImpl } from "@fullcalendar/core/internal";
import { createContext } from "react";

type TimetableContextType = {
  allSlots: { date: string; slots: slot[] }[];
  setAllSlots: React.Dispatch<
    React.SetStateAction<{ date: string; slots: slot[] }[]>
  >;
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

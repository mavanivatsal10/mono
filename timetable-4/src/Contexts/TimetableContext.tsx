import type { slot } from "@/types/types";
import type { EventImpl } from "@fullcalendar/core/internal";
import { createContext } from "react";

type allSlotsType = { date: string; slots: slot[] }[];
type editEventType = { showOverlay: boolean; eventData: EventImpl | null };

type addScheduleType = {
  date: Date | null | "default";
  isDefault: boolean;
  month: string;
  start: string;
  end: string;
  breaks: {
    start: string;
    end: string;
  }[];
  slotDuration: string;
};
type addSlotType = {
  title: string;
  description: string;
  date: Date | null;
  start: string;
  end: string;
  type: "slot" | "break" | "leave";
};
type addLeaveType = {
  date: Date | null;
  holidayType: "full" | "half" | "short";
  halfSession: "morning" | "afternoon";
  start: string;
  end: string;
};
type isOpenAddType = {
  open: boolean;
  addSchedule: addScheduleType | null;
  addSlot: addSlotType | null;
  addLeave: addLeaveType | null;
};

type TimetableContextType = {
  allSlots: allSlotsType;
  setAllSlots: React.Dispatch<React.SetStateAction<allSlotsType>>;
  specificDates: Set<string>;
  setSpecificDates: React.Dispatch<React.SetStateAction<Set<string>>>;
  editEvent: editEventType;
  setEditEvent: React.Dispatch<React.SetStateAction<editEventType>>;
  isOpenAdd: isOpenAddType;
  setIsOpenAdd: React.Dispatch<React.SetStateAction<isOpenAddType>>;
};

export const TimetableContext = createContext<TimetableContextType | null>(
  null
);

import type { slot } from "@/types/types";
import { createContext } from "react";

type TimetableContextType = {
  slots: slot[];
  setSlots: React.Dispatch<React.SetStateAction<slot[]>>;
  specificDates: Set<string>;
  setSpecificDates: React.Dispatch<React.SetStateAction<Set<string>>>;
};

export const TimetableContext = createContext<TimetableContextType | null>(
  null
);

import { TimetableContext } from "@/Contexts/TimetableContext";
import { useContext } from "react";

export const useTimetable = () => {
  const context = useContext(TimetableContext);
  if (!context) {
    throw new Error("useTimetable must be used within TimetableProvider");
  }
  return context;
};

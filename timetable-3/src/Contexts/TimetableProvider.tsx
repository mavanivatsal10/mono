import { useState } from "react";
import { TimetableContext } from "./TimetableContext";
import type { slot } from "@/types/types";

export const TimetableProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [slots, setSlots] = useState<slot[]>([
    {
      id: "something",
      title: "default slot",
      description: "default slot description",
      start: "09:30",
      end: "10:30",
      date: "2025-07-06",
      type: "slot",
    },
    {
      id: "something",
      title: "default slot",
      description: "default slot description",
      start: "15:30",
      end: "17:00",
      date: "2025-07-07",
      type: "slot",
    },
  ]);
  const [specificDates, setSpecificDates] = useState<Set<string>>(new Set());

  return (
    <TimetableContext.Provider
      value={{ slots, setSlots, specificDates, setSpecificDates }}
    >
      {children}
    </TimetableContext.Provider>
  );
};

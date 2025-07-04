import { useEffect, useState } from "react";
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
      date: "2025-07-04",
      type: "slot",
    },
  ]);
  const [specificDates, setSpecificDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    console.log(slots);
  }, [slots]);

  return (
    <TimetableContext.Provider
      value={{ slots, setSlots, specificDates, setSpecificDates }}
    >
      {children}
    </TimetableContext.Provider>
  );
};

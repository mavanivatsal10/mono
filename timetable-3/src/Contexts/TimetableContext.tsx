import type { slot } from "@/types/types";
import { createContext, useState } from "react";

type TimetableContextType = {
  slots: slot[];
  setSlots: React.Dispatch<React.SetStateAction<slot[]>>;
};

export const TimetableContext = createContext<TimetableContextType | null>(
  null
);

export const TimetableProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [slots, setSlots] = useState<slot[]>([]);
  return (
    <TimetableContext.Provider value={{ slots, setSlots }}>
      {children}
    </TimetableContext.Provider>
  );
};

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const compareTime = (
  time1: string,
  compareFlag: string,
  time2: string
) => {
  const [hour1, minute1] = time1.split(":");
  const [hour2, minute2] = time2.split(":");

  if (compareFlag === "isSame") {
    return hour1 === hour2 && minute1 === minute2;
  } else if (compareFlag === "isBefore") {
    return hour1 < hour2 || (hour1 === hour2 && minute1 < minute2);
  } else if (compareFlag === "isAfter") {
    return hour1 > hour2 || (hour1 === hour2 && minute1 > minute2);
  }
};

export const isOverlaping = (
  // string should be in this format "HH:MM"
  slot1: { start: string; end: string },
  slot2: { start: string; end: string }
) => {
  return (
    compareTime(slot1.end, "isAfter", slot2.start) &&
    compareTime(slot1.start, "isBefore", slot2.end)
  );
};

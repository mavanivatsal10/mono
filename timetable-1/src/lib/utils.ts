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

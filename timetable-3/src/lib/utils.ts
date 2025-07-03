import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isOverlaping = (
  // string should be in this format "HH:MM"
  slot1: { start: string; end: string },
  slot2: { start: string; end: string }
) => {
  return slot1.end > slot2.start && slot1.start < slot2.end;
};

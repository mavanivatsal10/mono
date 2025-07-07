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

export const getTimeNumsFromString = (time: string) =>
  time.split(":").map((t) => Number(t));

export const getTimeStringFromNums = (hour: number, minute: number) => {
  const hh = hour.toString().padStart(2, "0");
  const mm = minute.toString().padStart(2, "0");
  return `${hh}:${mm}`;
};

export const addMinutes = (hour: number, minute: number, minutes: number) => {
  const totalMinutes = hour * 60 + minute + minutes;
  const newHour = Math.floor(totalMinutes / 60);
  const newMinute = totalMinutes % 60;
  return [newHour, newMinute];
};

export const calculateSlotMinutes = (slot) => {
  if (!slot || !slot.start || !slot.end) return 0;
  const startNums = getTimeNumsFromString(slot.start);
  const endNums = getTimeNumsFromString(slot.end);
  return (endNums[0] - startNums[0]) * 60 + (endNums[1] - startNums[1]);
};

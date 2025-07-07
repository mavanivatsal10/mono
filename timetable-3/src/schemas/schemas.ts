import z from "zod";

export const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
export const timeSchema = z
  .string()
  .regex(timeRegex, { message: "Please enter a valid time" });

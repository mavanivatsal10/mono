import { z } from "zod";
import { obj } from "./countries";

function checkFileType(file: File) {
  if (file?.name) {
    const fileType = file.name.split(".").pop();
    if (fileType === "pdf") return true;
  }
  return false;
}

export const step1Schema = z.object({
  fname: z.string().min(2, "First name must be at least 2 characters long"),
  lname: z.string().min(2, "Last name must be at least 2 characters long"),
  email: z.string().min(1, "Email is required").email(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Must be a valid Indian phone number"),
});

export const step2Schema = z.object({
  address1: z.string().min(3, "Address must be at least 3 characters long"),
  address2: z.string().min(3, "Address must be at least 3 characters long"),
  country: z.enum(
    Object.values(obj).map((country) => country.name),
    {
      errorMap: (issue, ctx) => ({ message: "Please select a valid country" }),
    }
  ),
  state: z.string().min(2, "Please select a valid state"),
  preferredContact: z.enum(["email", "phone"], {
    errorMap: (issue, ctx) => ({
      message: "Please select a preferred contact method",
    }),
  }),
  sub: z.boolean().default(false),
});

export const step3Schema = z.object({
  skills: z
    .array(z.object({ skill: z.string().min(1, "Please enter a valid skill") }))
    .max(5, "You can select a maximum of 5 skills"),
  resume: z
    .instanceof(File, { message: "Resume is required" })
    .refine((file) => ["application/pdf"].includes(file.type), {
      message: "Invalid document file type",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size should not exceed 5MB",
    }),
});

export const combinedCheckoutSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema);

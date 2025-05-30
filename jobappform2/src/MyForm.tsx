const formSchema = z.object({
    fname: z.string().min(1, "First name is required"),
    lname: z.string().min(1, "Last name is required"),
    email: z.string().min(1, "Email is required").email(),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid Indian phone number"),
    address1: z.string().min(3, "Address must be at least 3 characters long"),
    address2: z.string().min(3, "Address must be at least 3 characters long"),
    country: z.enum(
      Object.values(obj).map((country) => country.name),
      {
        required_error: "Please select a country",
      }
    ),
    state: z.string().min(2, "Please select a valid state"),
    preferredContact: z.enum(["email", "phone"], {
      required_error: "Please select a preferred contact method",
    }),
    resume: z
      .instanceof(File, { message: "Resume is required" })
      .refine((file) => ["application/pdf"].includes(file.type), {
        message: "Invalid document file type",
      })
      .refine((file) => file.size <= 5 * 1024 * 1024, {
        message: "File size should not exceed 5MB",
      }),
})

export default function MyForm() {
    const form = useForm();
}
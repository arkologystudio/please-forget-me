import * as z from "zod";

// Update the evidence schema to separate prompts
const evidenceSchema = z.object({
  chatLinks: z
    .array(z.string().min(2, "Please enter a chat link URL"))
    .optional(),
  additionalNotes: z.string().optional(),
});

export const rtbhFormSchema = z.object({
  organisations: z
    .array(z.string())
    .min(1, "Please select at least one company"),
  reasons: z.array(z.string()).min(1, "Please select at least one reason"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  birthDate: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      if (!date) return false;
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      // Adjust age if birthday hasn't occurred this year
      const currentAge =
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ? age - 1
          : age;

      return currentAge >= 18;
    }, "You must be at least 18 years old to submit this request."),
  country: z.string().optional(),
  email: z.string().email("Please enter a valid email"),
  // Common field for all LLM interactions
  prompts: z.array(z.string()).min(1, "At least one prompt is required"),
  evidence: z.record(z.string(), evidenceSchema).optional(),
  authorization: z.boolean().refine((val) => val === true, {
    message: "You must authorize the request",
  }),
  signature: z.string().optional(),
});

export type RTBHFormValues = z.infer<typeof rtbhFormSchema>;

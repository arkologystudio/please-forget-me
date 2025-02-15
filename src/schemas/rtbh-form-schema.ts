import * as z from "zod";

// Update the evidence schema to separate prompts
const evidenceSchema = z.object({
  chatLinks: z
    .array(z.string().min(2, "Please enter a chat link URL"))
    .optional(),
  additionalNotes: z.string().optional(),
});

export const rtbhFormSchema = z.object({
  prompts: z.array(z.string()).min(1, "At least one prompt is required"),
  evidence: z.record(z.string(), evidenceSchema).optional(),
});

export type RTBHFormValues = z.infer<typeof rtbhFormSchema>;

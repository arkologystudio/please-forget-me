import * as z from "zod";

// Define the schema for individual evidence fields
const evidenceFieldsSchema = z.object({
  chatLinks: z
    .array(z.string().url("Please enter a valid URL"))
    .optional(),
  additionalNotes: z.string().optional(),
});

export const rtbhFormSchema = z.object({
  prompts: z.array(z.string()).min(1, "At least one prompt is required"),
  // Evidence is now a record with company slugs as keys
  evidence: z.record(evidenceFieldsSchema).refine(
    (evidence) => {
      // At least one company should have evidence
      return Object.values(evidence).some(
        (companyEvidence) => 
          companyEvidence.chatLinks?.length || 
          companyEvidence.additionalNotes
      );
    },
    {
      message: "Please provide evidence for at least one company",
    }
  ),
});

export type RTBHFormValues = z.infer<typeof rtbhFormSchema>;

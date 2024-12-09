import * as z from "zod"

type EvidenceField = {
  label: string
  placeholder: string
  required: boolean
}

export type Company = {
  id: string
  label: string
  email: string
  evidenceFields: {
    chatLinks?: EvidenceField
  }
}


export const companies = [
  { 
    id: "openai", 
    label: "OpenAI (ChatGPT)", 
    email: "privacy@openai.com",
    evidenceFields: {
      chatLinks: {
        label: "ChatGPT Chat Links",
        placeholder: "https://chat.openai.com/...",
        required: false
      }
    }
  },
  { 
    id: "anthropic", 
    label: "Anthropic (Claude)", 
    email: "-",
    evidenceFields: {
      chatLinks: {
        label: "Claude Chat Links",
        placeholder: "https://claude.ai/...",
        required: false
      }
    }
  },
  { 
    id: "meta", 
    label: "Meta (LLama)", 
    email: "-",
    evidenceFields: {
      chatLinks: {
        label: "LLama Chat Links",
        placeholder: "https://...",
        required: false
      }
    }
  },
] as const

export const reasons = [
  { 
    id: "personal_impact", 
    label: "Personal or Professional Impact",
    tooltip: "Under GDPR Article 17, you can request erasure if the data is no longer necessary or if it significantly impacts your personal or professional life. This includes situations where outdated or irrelevant data affects your reputation or opportunities."
  },
  { 
    id: "unlawful_processing", 
    label: "Data Processing Was Unlawful",
    tooltip: "Under GDPR Article 17, you have the right to erasure if your personal data has been processed without legal basis or consent. This includes data collected without proper authorization or used beyond its intended purpose."
  },
  { 
    id: "inaccuracy", 
    label: "Inaccuracy or Misrepresentation",
    tooltip: "Under GDPR Article 17, you have the right to erasure if your personal data is inaccurate or misrepresents you. This ensures that AI systems don't perpetuate or learn from incorrect information about you."
  },
] as const

// Update the evidence schema to separate prompts
const evidenceSchema = z.object({
  chatLinks: z.array(
    z.string()
      .min(2, "Please enter a chat link URL")
  ).optional(),
  additionalNotes: z.string().optional(),
})

export const rtbfFormSchema = z.object({
  companies: z.array(z.string()).min(1, "Please select at least one company"),
  reasons: z.array(z.string()).min(1, "Please select at least one reason"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  birthDate: z.string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      if (!date) return false;
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // Adjust age if birthday hasn't occurred this year
      const currentAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ? age - 1
        : age;
      
      return currentAge >= 18;
    }, "You must be at least 18 years old to submit this request."),
  country: z.string().min(2, "Please select a country"),
  email: z.string().email("Please enter a valid email"),
  // Common field for all LLM interactions
  prompts: z.array(z.string()).optional(),
  evidence: z.record(z.string(), evidenceSchema),
  authorization: z.boolean().refine(val => val === true, { message: "You must authorize the request" }),
  signature: z.string()
    .min(22, "Please provide a valid signature")
    .refine((val) => val.startsWith('data:image'), {
      message: "Invalid signature format"
    }),
})

export type RTBFFormValues = z.infer<typeof rtbfFormSchema> 
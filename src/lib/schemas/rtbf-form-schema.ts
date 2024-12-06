import * as z from "zod"
import { isValidPhoneNumber } from "react-phone-number-input"


export const companies = [
  { id: "openai", label: "OpenAI (ChatGPT)", email: "privacy@openai.com" },
  { id: "anthropic", label: "Anthropic (Claude)", email: "privacy@anthropic.com" },
  { id: "meta", label: "Meta (LLama)", email: "privacy@meta.com" },
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

export const rtbfFormSchema = z.object({
  companies: z.array(z.string()).min(1, "Please select at least one company"),
  reasons: z.array(z.string()).min(1, "Please select at least one reason"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  country: z.string().min(2, "Please select a country"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().refine(isValidPhoneNumber, { message: "Invalid phone number" }).optional(),
  evidence: z.object({
    openai: z.array(z.string().url()).optional(),
    anthropic: z.array(z.string().url()).optional(),
    meta: z.array(z.string().url()).optional(),
    prompts: z.string().optional(),
    urls: z.string().optional(),
  }),
  authorization: z.boolean().refine(val => val === true, { message: "You must authorize the request" }),
  signature: z.string().min(2, "Signature must be at least 2 characters"),
})

export type RTBFFormValues = z.infer<typeof rtbfFormSchema> 
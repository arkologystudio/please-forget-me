import * as z from "zod"
import { isValidPhoneNumber } from "react-phone-number-input"


export const companies = [
  { id: "openai", label: "OpenAI (ChatGPT)", email: "privacy@openai.com" },
  { id: "anthropic", label: "Anthropic (Claude)", email: "-" },
  { id: "meta", label: "Meta (LLama)", email: "-" },
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
    }, "You must be at least 18 years old to submit this request. If you are under 18, please have a parent or legal guardian submit this request on your behalf."),
  country: z.string().min(2, "Please select a country"),
  email: z.string().email("Please enter a valid email"),
  // phone: z.union([
  //   z.string().length(0),  // empty string is valid
  //   z.string().refine(
  //     (val) => isValidPhoneNumber(val),
  //     { message: "Invalid phone number" }
  //   ),
  // ]).optional(), 
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
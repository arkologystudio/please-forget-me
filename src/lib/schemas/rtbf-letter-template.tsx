import { type RTBFFormValues } from "./rtbf-form-schema"
import { companies, reasons } from "./rtbf-form-schema"

export function generateLetter(data: RTBFFormValues): string {
  const selectedCompanies = data.companies.map(id => 
    companies.find(c => c.id === id)
  ).filter(Boolean)
  
  const selectedReasons = data.reasons.map(id =>
    reasons.find(r => r.id === id)
  ).filter(Boolean)

  return `Dear ${selectedCompanies.map(c => c?.label).join(", ")},

I am writing to request the deletion of personal data under Article 17 of the General Data Protection Regulation (GDPR) on behalf of ${data.firstName} ${data.lastName}.

Personal Details:
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Country: ${data.country}

Reasons for Deletion:
${selectedReasons.map(r => `- ${r?.label}`).join("\n")}

${data.evidence.openai?.length ? `\nChatGPT Evidence Links:\n${data.evidence.openai.join("\n")}` : ""}
${data.evidence.anthropic?.length ? `\nClaude Evidence Links:\n${data.evidence.anthropic.join("\n")}` : ""}
${data.evidence.meta?.length ? `\nLLama Evidence Links:\n${data.evidence.meta.join("\n")}` : ""}

I look forward to receiving confirmation that you have complied with my request.

Best regards,
${data.firstName} ${data.lastName}`
}

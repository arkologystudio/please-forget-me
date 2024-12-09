import { type RTBFFormValues } from "./rtbf-form-schema"
import { companies, reasons, type Company } from "./rtbf-form-schema"

type LetterOutput = {
  to: string
  subject: string
  body: string
}

function generateCompanyLetter(
  data: RTBFFormValues,
  company: Company,
  selectedReasons: (typeof reasons)[number][]
): LetterOutput {
  const companyEvidence = data.evidence[company.id]
  
  const body = `Dear ${company.label},

I am writing to request the deletion of personal data under Article 17 of the General Data Protection Regulation (GDPR).

Personal Details:
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Country: ${data.country}
Date of Birth: ${data.birthDate}

Reasons for Deletion:
${selectedReasons.map(r => `- ${r?.label}`).join("\n")}

${data.prompts?.length ? `\nLLM Prompts:\n${data.prompts?.join("\n")}` : ""}

Evidence:
${companyEvidence?.chatLinks?.length ? `\nChat Links:\n${companyEvidence.chatLinks.join("\n")}` : ""}
${companyEvidence?.additionalNotes ? `\nAdditional Context:\n${companyEvidence.additionalNotes}` : ""}

I look forward to receiving confirmation that you have complied with my request within one month, as required by Article 12(3) GDPR.

Best regards,
${data.firstName} ${data.lastName}
${data.signature}`

  return {
    to: company.email,
    subject: `GDPR Article 17 - Right to Erasure Request - ${data.firstName} ${data.lastName}`,
    body
  }
}

export function generateLetters(data: RTBFFormValues): LetterOutput[] {
  const selectedCompanies = data.companies
    .map(id => companies.find(c => c.id === id))
    .filter((c): c is typeof companies[number] => c !== undefined)
  
  const selectedReasons = data.reasons
    .map(id => reasons.find(r => r.id === id))
    .filter((r): r is (typeof reasons)[number] => r !== undefined)

  return selectedCompanies.map(company => 
    generateCompanyLetter(data, company, selectedReasons)
  )
}

// For preview purposes in the form
export function generatePreviewLetter(data: RTBFFormValues): string {
  const letters = generateLetters(data)
  
  if (letters.length === 0) return "No companies selected"
  if (letters.length === 1) return letters[0].body
  
  // If multiple letters, show a preview of all
  return letters.map(letter => 
    `To: ${letter.to}\nSubject: ${letter.subject}\n\n${letter.body}`
  ).join('\n\n---\n\n')
}

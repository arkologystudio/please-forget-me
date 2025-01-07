import { type RTBFFormValues } from "./rtbf-form-schema"
import { organisations, reasons, OrganisationInput} from "./rtbf-form-schema"

export type LetterOutput = {
  to: string
  subject: string
  body: string
}

function generateLetter(
  data: RTBFFormValues,
  organisation: OrganisationInput,
  selectedReasons: (typeof reasons)[number][]
): LetterOutput {
  const organisationEvidence = data.evidence?.[organisation.slug]
  
  const signatureHtml = data.signature ? 
    `\n<img src="${data.signature}" alt="Signature" style="max-width: 400px; height: auto;" />\n` : 
    '[No signature provided]'

  const body = `Dear ${organisation.label},

I am writing to request the deletion of personal data.

I confirm that I am the individual whose data this request concerns and I authorize Please Forget Me to submit this request on my behalf. 

Personal Details:
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Country: ${data.country || "Not provided"}
Date of Birth: ${data.birthDate}

Reasons for Deletion:
${selectedReasons.map(r => `- ${r?.label}`).join("\n")}

${data.prompts?.length ? `\nLLM Prompts:\n${data.prompts?.join("\n")}` : ""}

Evidence:
${organisationEvidence?.chatLinks?.length ? `\nChat Links:\n${organisationEvidence.chatLinks.join("\n")}` : ""}
${organisationEvidence?.additionalNotes ? `\nAdditional Context:\n${organisationEvidence.additionalNotes}` : ""}

I look forward to receiving confirmation of this request, and a follow up that you have complied with my request within one month.

Best regards,
${data.firstName} ${data.lastName}
${signatureHtml}`

  return {
    to: organisation.email,
    subject: `Right to Erasure Request (${data.firstName} ${data.lastName})`,
    body
  }
}

export function generateLetters(data: RTBFFormValues): LetterOutput[] {
  const selectedOrganisations = data.organisations
    .map(slug => organisations.find(c => c.slug === slug))
    .filter((c): c is typeof organisations[number] => c !== undefined)
  
  const selectedReasons = data.reasons
    .map(id => reasons.find(r => r.id === id))
    .filter((r): r is (typeof reasons)[number] => r !== undefined)

  return selectedOrganisations.map(organisation => 
    generateLetter(data, organisation, selectedReasons)
  )
}

// For preview purposes in the form
export function generatePreviewLetter(data: RTBFFormValues, index: number = 0): {
  body: string,
  currentIndex: number,
  total: number,
  isHtml: boolean
} {
  const letters = generateLetters(data)
  
  if (letters.length === 0) return { 
    body: "No organisations selected", 
    currentIndex: 0, 
    total: 0,
    isHtml: false
  }

  // Ensure index is within bounds
  const safeIndex = Math.max(0, Math.min(index, letters.length - 1))
  const letter = letters[safeIndex]
  
  return {
    body: `To: ${letter.to}\nSubject: ${letter.subject}\n\n${letter.body}`,
    currentIndex: safeIndex,
    total: letters.length,
    isHtml: true
  }
}

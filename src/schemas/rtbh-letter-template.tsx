import { OrganisationInputWithEvidenceFields } from "@/types/organisation";
import { type RTBHFormValues } from "./rtbh-form-schema";

import {
  organisationsWithEvidenceFields,
  rtbfReasons,
} from "@/constants/organisation";
import { LetterOutput } from "@/types/general";
function generateLetter(
  data: RTBHFormValues,
  organisation: OrganisationInputWithEvidenceFields,
  selectedReasons: (typeof rtbfReasons)[number][]
): LetterOutput {
  const organisationEvidence = data.evidence?.[organisation.slug];

  const signatureHtml = data.signature
    ? `\n<img src="${data.signature}" alt="Signature" style="max-width: 400px; height: auto;" />\n`
    : "[No signature provided]";

  const body = `Dear ${organisation.label},

I am writing to request that me and my identity are are hidden from model outputs from models created by your organisation.

I confirm that I am the individual whose data this request concerns and I authorize Please Forget Me to submit this request on my behalf. 

Personal Details:
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Country: ${data.country || "Not provided"}
Date of Birth: ${data.birthDate}

Reasons for Deletion:
${selectedReasons.map((r) => `- ${r?.label}`).join("\n")}

${data.prompts?.length ? `\nLLM Prompts:\n${data.prompts?.join("\n")}` : ""}

Evidence:
${
  organisationEvidence?.chatLinks?.length
    ? `\nChat Links:\n${organisationEvidence.chatLinks.join("\n")}`
    : ""
}
${
  organisationEvidence?.additionalNotes
    ? `\nAdditional Context:\n${organisationEvidence.additionalNotes}`
    : ""
}

I look forward to receiving confirmation of this request, and a follow up that you have complied with my request within one month.

Best regards,
${data.firstName} ${data.lastName}
${signatureHtml}`;

  return {
    to: organisation.email,
    subject: `Request to hide identity from model outputs (${data.firstName} ${data.lastName})`,
    body,
  };
}

export function generateRtbhLetters(data: RTBHFormValues): LetterOutput[] {
  const selectedOrganisations = data.organisations
    .map((slug) => organisationsWithEvidenceFields.find((c) => c.slug === slug))
    .filter(
      (c): c is (typeof organisationsWithEvidenceFields)[number] =>
        c !== undefined
    );

  const selectedReasons = data.reasons
    .map((id) => rtbfReasons.find((r) => r.id === id))
    .filter((r): r is (typeof rtbfReasons)[number] => r !== undefined);

  return selectedOrganisations.map((organisation) =>
    generateLetter(data, organisation, selectedReasons)
  );
}

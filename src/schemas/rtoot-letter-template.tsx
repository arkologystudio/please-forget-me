import { OrganisationInput } from "@/types/organisation";
import { type RTOOTFormValues } from "./rtoot-form-schema";
import { organisations } from "@/constants/organisation";
import { LetterOutput } from "@/types/general";

function generateLetter(
  data: RTOOTFormValues,
  organisation: OrganisationInput
): LetterOutput {
  const signatureHtml = data.signature
    ? `\n<img src="${data.signature}" alt="Signature" style="max-width: 400px; height: auto;" />\n`
    : "[No signature provided]";

  const body = `Dear ${organisation.label},

I am writing to request that you do not train AI or machine learning models on my data.

I confirm that I am the individual whose data this request concerns and I authorize Please Forget Me to submit this request on my behalf. 

Personal Details:
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Country: ${data.country || "Not provided"}
Date of Birth: ${data.birthDate}


I look forward to receiving confirmation of this request, and a follow up that you have complied with my request within one month.

Best regards,
${data.firstName} ${data.lastName}
${signatureHtml}`;

  return {
    to: organisation.email,
    subject: `Right to Opt Out of AI Training Request (${data.firstName} ${data.lastName})`,
    body,
  };
}

export function generateRtootLetters(data: RTOOTFormValues): LetterOutput[] {
  const selectedOrganisations = data.organisations
    .map((slug) => organisations.find((c) => c.slug === slug))
    .filter((c): c is (typeof organisations)[number] => c !== undefined);

  return selectedOrganisations.map((organisation) =>
    generateLetter(data, organisation)
  );
}

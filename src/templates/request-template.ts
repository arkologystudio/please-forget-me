import { OrganisationInput } from "@/types/organisation";
import { type PersonalInfoFormValues } from "@/schemas/personal-info-form-schema";
import { type RTBHFormValues } from "@/schemas/rtbh-form-schema";
import { organisations } from "@/constants/organisation";
import { LetterOutput } from "@/types/general";
import { type RequestType } from "@/types/requests";

const generateLetter = (
  data: PersonalInfoFormValues & Partial<RTBHFormValues>,
  organisation: OrganisationInput,
  requests: RequestType[]
): LetterOutput => {
  const signatureHtml = data.signature
    ? `\n<img src="${data.signature}" alt="Signature" style="max-width: 400px; height: auto;" />\n`
    : "[No signature provided]";

  const body = `Dear ${organisation.label},

I am writing to request that you adhere to the following requests:

${requests
  .map((request, index) => {
    let requestDetails = `${index + 1}. ${request.label}: ${
      request.description
    }`;
    if (
      request.label === "rtbh" &&
      "reasons" in data &&
      "prompts" in data &&
      "evidence" in data
    ) {
      const reasons = data.reasons?.join(", ") || "None";
      const prompts = data.prompts?.join(", ") || "None";
      const chatLinks =
        data.evidence?.[organisation.slug]?.chatLinks?.join(", ") || "None";
      const additionalNotes =
        data.evidence?.[organisation.slug]?.additionalNotes || "None";
      requestDetails += `\nReasons: ${reasons}\nPrompts: ${prompts}\nEvidence:\nChat links: ${chatLinks}\nAdditional notes: ${additionalNotes}`;
    }
    return requestDetails;
  })
  .join("\n")}

I confirm that I am the individual whose data this request concerns and I authorize Please Forget Me to submit this request on my behalf. 

Personal Details:
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Country: ${data.country || "Not provided"}
Date of Birth: ${data.birthDate}


I look forward to receiving confirmation of this request, and a follow up that you have complied with my request within one month.

Best regards,
${data.firstName} ${data.lastName}`;

  return {
    to: organisation.email,
    subject: `Right to Opt Out of AI Training Request (${data.firstName} ${data.lastName})`,
    body,
  };
};

export function generateLetters(
  data: PersonalInfoFormValues & Partial<RTBHFormValues>,
  requests: RequestType[]
): LetterOutput[] {
  const selectedOrganisations = data.organisations
    .map((slug) => organisations.find((c) => c.slug === slug))
    .filter((c): c is (typeof organisations)[number] => c !== undefined);

  return selectedOrganisations.map((organisation) =>
    generateLetter(data, organisation, requests)
  );
}

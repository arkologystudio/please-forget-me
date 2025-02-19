import { OrganisationInput } from "@/types/organisation";
import { type PersonalInfoFormValues } from "@/schemas/personal-info-form-schema";
import { type RTBHFormValues } from "@/schemas/rtbh-form-schema";
import { organisations } from "../../prisma/organisations";
import { LetterOutput } from "@/types/general";
import { type RequestType } from "@/types/requests";

const generateLetter = (
  data: PersonalInfoFormValues & Partial<RTBHFormValues>,
  organisation: OrganisationInput,
  requests: RequestType[]
): LetterOutput => {
  // const signatureHtml = data.signature
  //   ? `\n<img src="${data.signature}" alt="Signature" style="max-width: 400px; height: auto;" />\n`
  //   : "[No signature provided]";

  const body = `Dear ${organisation.label},

I am writing to request that you adhere to the following requests, in accordance with my data protection rights:

${requests
  .map((request, index) => {
    let requestDetails = `${index + 1}. ${request.label}: ${request.description}`;
    if (request.label === "rtbh" && "prompts" in data) {
      const prompts = data.prompts?.join(", ");
      // Get evidence specific to this organisation
      const orgEvidence = data.evidence?.[organisation.slug];
      const chatLinks = orgEvidence?.chatLinks?.join(", ");
      const additionalNotes = orgEvidence?.additionalNotes;

      if (prompts) {
        requestDetails += `\n\nPrompts: ${prompts}`;
      }

      if (chatLinks || additionalNotes) {
        requestDetails += "\n\nEvidence:";
        if (chatLinks) {
          requestDetails += `\nChat links: ${chatLinks}`;
        }
        if (additionalNotes) {
          requestDetails += `\nAdditional notes: ${additionalNotes}`;
        }
      }
    }
    return requestDetails;
  })
  .join("\n\n")}

I confirm that I am the individual whose data this request concerns and I authorize Please Forget Me to submit this request on my behalf. 

Personal Details:
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Country: ${data.country || "Not provided"}
Date of Birth: ${data.birthDate}

I look forward to receiving confirmation of this request, and a follow up that you have complied with my request within a reasonable time.

Kindly,
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

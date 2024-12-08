import formData from "form-data";
import Mailgun, { MailgunMessageData } from "mailgun.js";

import { Organisation, User } from "@prisma/client";
import { reasons, RTBFFormValues } from "@/lib/schemas/rtbf-form-schema";

const DOMAIN = process.env.MAILGUN_DOMAIN || "";
const API_KEY = process.env.MAILGUN_API_KEY || "";
const FROM_EMAIL = process.env.ORGANISATION_EMAIL || ""; //TODO make a new email
const ORGANISATION_EMAIL = process.env.ORGANISATION_EMAIL || ""; //TODO make a new email

const mg = new Mailgun(formData).client({
  username: "api",
  key: API_KEY,
  url: "https://api.eu.mailgun.net",
});

// Helper function to generate the letter
function generateLetter(data: RTBFFormValues, organisation: Organisation) {
  const selectedReasons = data.reasons
    .map((id) => reasons.find((r) => r.id === id))
    .filter(Boolean);

  return `Dear ${organisation.name},

I am writing to request the deletion of personal data under Article 17 of the General Data Protection Regulation (GDPR) on behalf of ${
    data.firstName
  } ${data.lastName}.

Personal Details:
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Country: ${data.country}

Reasons for Deletion:
${selectedReasons.map((r) => `- ${r?.label}`).join("\n")}

${
  data.evidence.openai?.length
    ? `\nChatGPT Evidence Links:\n${data.evidence.openai.join("\n")}`
    : ""
}
${
  data.evidence.anthropic?.length
    ? `\nClaude Evidence Links:\n${data.evidence.anthropic.join("\n")}`
    : ""
}
${
  data.evidence.meta?.length
    ? `\nLLama Evidence Links:\n${data.evidence.meta.join("\n")}`
    : ""
}

I look forward to receiving confirmation that you have complied with my request.

Best regards,
${data.firstName} ${data.lastName}`;
}

export const sendInitialRequestEmail = async (
  recipient: Organisation,
  data: RTBFFormValues
) => {
  console.log("sendInitialRequestEmail called with arguments:", {
    recipient,
    data,
  });

  console.log("Environment variables:", {
    FROM_EMAIL,
    ORGANISATION_EMAIL,
    API_KEY: API_KEY ? "set" : "not set",
    DOMAIN: DOMAIN ? "set" : "not set",
  });
  try {
    const emailContent = generateLetter(data, recipient);

    const mailData: MailgunMessageData = {
      from: `Citizen of the Internet <${FROM_EMAIL}>`,
      to: recipient.email.toString(),
      subject: "Right to be forgotten request",
      text: emailContent,
    };

    console.log("mailData:", mailData, DOMAIN);

    const body = await mg.messages.create(DOMAIN, mailData);
    console.log("Email sent:", body);
    return body;
  } catch (error) {
    console.error("Error sending initial request email:", error);
    throw error;
  }
};

export const sendDeliveryConfirmationEmail = async (recipient: User) => {
  try {
    const data: MailgunMessageData = {
      from: `Please Forget Me <${ORGANISATION_EMAIL}>`,
      to: recipient.email,
      subject: "Delivery Confirmation: Request to be forgotten",
      text: "This is an email to confirm that your request to be forgotten has been delivered to the relevant organisation.",
    };

    const body = await mg.messages.create(DOMAIN, data);
    console.log("Email sent:", body);
    return body;
  } catch (error) {
    console.error("Error sending thread confirmation email:", error);
    throw error;
  }
};

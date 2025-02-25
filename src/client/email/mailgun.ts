import formData from "form-data";
import Mailgun, { MailgunMessageData } from "mailgun.js";

import { User } from "@prisma/client";
import { RTBHFormValues } from "@/schemas/rtbh-form-schema";
import { PersonalInfoFormValues } from "@/schemas/personal-info-form-schema";
import { LetterOutput } from "@/types/general";

const DOMAIN = process.env.MAILGUN_DOMAIN || "";
const FROM_EMAIL = process.env.ORGANISATION_EMAIL || ""; //TODO make a new email
const ORGANISATION_EMAIL = process.env.ORGANISATION_EMAIL || ""; //TODO make a new email

export const sendMailRequest = async (
  letter: LetterOutput,
  formValues: PersonalInfoFormValues & Partial<RTBHFormValues>
) => {
  const mg = createMailgunClient();
  console.log("sendInitialRequestEmail called with arguments:", {
    letter,
  });

  console.log("Environment variables:", {
    FROM_EMAIL,
    ORGANISATION_EMAIL,
    DOMAIN: DOMAIN ? "set" : "not set",
  });
  try {
    const mailData: MailgunMessageData = {
      from: `Citizen of the Internet <${formValues.email}>`,
      to: process.env.NEXT_PUBLIC_IS_DEV ? "info@arkology.co.za" : letter.to, // send to info@arkology.co.za in dev
      subject: letter.subject,
      text: letter.body,
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
export const sendDeliveryConfirmationEmail = async (
  recipient: User,
  request: string
) => {
  try {
    const mg = createMailgunClient();
    const data: MailgunMessageData = {
      from: `Please Forget Me <${ORGANISATION_EMAIL}>`,
      to: recipient.email,
      subject: `Delivery Confirmation: ${request} Request`,
      text: "This is an email to confirm that your request has been delivered to the relevant organisations.",
    };

    const body = await mg.messages.create(DOMAIN, data);
    console.log("Email sent:", body);
    return body;
  } catch (error) {
    console.error("Error sending thread confirmation email:", error);
    throw error;
  }
};

const createMailgunClient = () => {
  try {
    if (!process.env.MAILGUN_API_KEY) {
      throw new Error("MAILGUN_API_KEY is not set");
    }
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
      username: "api",
      key: process.env.MAILGUN_API_KEY,
    });
    return mg;
  } catch (error) {
    console.error("Error creating mailgun client:", error);
    throw error;
  }
};

export const sendVerificationEmail = async (email: string, code: string) => {
  try {
    const mg = createMailgunClient();

    const messageData: MailgunMessageData = {
      from: "Please Forget Me <noreply@pleaseforget.me>",
      to: email,
      subject: "Verification Code (Please Forget Me)",
      text: `Your verification code is: ${code}. It will expire in 10 minutes.`,
    };

    const body = await mg.messages.create(DOMAIN, messageData);
    return body;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

import mailgun from "mailgun-js";
import dotenv from "dotenv";
import { Organisation, User } from "@prisma/client";

dotenv.config();

const DOMAIN = process.env.MAILGUN_DOMAIN || "";
const API_KEY = process.env.MAILGUN_API_KEY || "";
const FROM_EMAIL = process.env.ORGANISATION_EMAIL || ""; //TODO make a new email
const ORGANISATION_EMAIL = process.env.ORGANISATION_EMAIL || ""; //TODO make a new email
const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });

export const sendInitialRequestEmail = async (
  recipient: Organisation
): Promise<mailgun.messages.SendResponse> => {
  try {
    const data: mailgun.messages.SendData = {
      from: `Excited User <${FROM_EMAIL}>`,
      to: recipient.email.toString(),
      subject: "Hello with Async/Await",
      text: "This is a test email sent using Mailgun and TypeScript with async/await!",
    };

    const body = await mg.messages().send(data);
    console.log("Email sent:", body);
    return body;
  } catch (error) {
    console.error("Error sending initial request email:", error);
    throw error;
  }
};

export const sendThreadConfirmationEmail = async (
  recipient: User
): Promise<mailgun.messages.SendResponse> => {
  try {
    const data: mailgun.messages.SendData = {
      from: `Excited User <${ORGANISATION_EMAIL}>`,
      to: recipient.email,
      subject: "Hello with Async/Await",
      text: "This is a test email sent using Mailgun and TypeScript with async/await!",
    };

    const body = await mg.messages().send(data);
    console.log("Email sent:", body);
    return body;
  } catch (error) {
    console.error("Error sending thread confirmation email:", error);
    throw error;
  }
};

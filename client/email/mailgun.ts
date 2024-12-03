import mailgun from "mailgun-js";
import dotenv from "dotenv";
import { Prisma } from "@prisma/client";

dotenv.config();

const DOMAIN = process.env.MAILGUN_DOMAIN || "";
const API_KEY = process.env.MAILGUN_API_KEY || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "";
const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });

export const sendEmail = async (recipient: Prisma.OrganisationDelegate) => {
  try {
    const data: mailgun.messages.SendData = {
      from: `Excited User <${FROM_EMAIL}>`,
      to: recipient.fields.email.toString(),
      subject: "Hello with Async/Await",
      text: "This is a test email sent using Mailgun and TypeScript with async/await!",
    };

    const body = await mg.messages().send(data);
    console.log("Email sent:", body);
  } catch (error) {
    console.error("Error:", error);
  }
};

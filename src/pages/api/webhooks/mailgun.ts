import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import getRawBody from "raw-body";
// import qs from "qs";
import { PrismaClient } from "@prisma/client";
import { MailgunEventData, MailgunWebhookSignature } from "@/types/mailgun";
import { sendDeliveryConfirmationEmail } from "../../../../client/email/mailgun";
// Disable Next.js's default body parser to access raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

// Main handler function
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    // Get raw body as a string
    const raw = await getRawBody(req, {
      encoding: "utf-8",
    });

    // Parse the raw body using qs
    const parsed = JSON.parse(raw);
    console.log("Parsed webhook payload:", parsed);

    // Extract and validate the signature using the Mailgun Interfaces type
    const signature = parsed["signature"] as
      | MailgunWebhookSignature
      | undefined;
    if (!signature) {
      console.warn("No signature found in the webhook payload.");
      return res.status(400).json({ message: "No signature found." });
    }

    const { timestamp, token, signature: tokenSignature } = signature;

    if (!timestamp || !token || !tokenSignature) {
      console.warn("Incomplete signature data.");
      return res.status(400).json({ message: "Incomplete signature data." });
    }

    // Verify the signature
    const isValid = verifySignature(timestamp, token, tokenSignature);
    if (!isValid) {
      console.warn("Invalid signature.");
      return res.status(400).json({ message: "Invalid signature." });
    }

    // Extract and validate event data
    const eventData = parsed["event-data"];

    if (!isMailgunEventData(eventData)) {
      console.warn("Invalid or missing event data.");
      return res.status(400).json({ message: "Invalid event data." });
    }

    const event = eventData as MailgunEventData;

    // Handle specific events
    switch (event.event) {
      case "queued":
        await handleQueued(event);
        break;
      case "delivered":
        await handleDelivered(event);
        break;
      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    // Respond with a success status
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Function to verify Mailgun webhook signature
function verifySignature(
  timestamp: string,
  token: string,
  signature: string
): boolean {
  const apiKey = process.env.MAILGUN_WEBHOOK_SIGNING_KEY || "";
  if (!apiKey) {
    console.error(
      "MAILGUN_WEBHOOK_SIGNING_KEY is not set in the environment variables."
    );
    return false;
  }

  const hmac = crypto.createHmac("sha256", apiKey);
  hmac.update(timestamp + token);
  const expectedSignature = hmac.digest("hex");
  return expectedSignature === signature;
}

// Handler for 'queued' event
async function handleQueued(event: MailgunEventData) {
  const prisma = new PrismaClient();

  const messageId = event["message"].headers["message-id"];

  try {
    const existingEmail = await prisma.email.findUnique({
      where: { mailgunId: messageId },
    });
    if (!existingEmail) {
      console.warn(`Email with Message-Id ${messageId} not found.`);
      return;
    }
    await prisma.email.update({
      where: { mailgunId: messageId },
      data: { status: "queued" },
    });

    console.log(`Email queued: ${messageId}`);
  } catch (error) {
    console.error(
      `Failed to handle queued event for Message-Id ${messageId}:`,
      error
    );
  }
}

// Handler for 'delivered' event
async function handleDelivered(event: MailgunEventData) {
  const messageId = event["message"].headers["message-id"];

  try {
    const prisma = new PrismaClient();
    const existingEmail = await prisma.email.findUnique({
      where: { mailgunId: messageId },
    });
    if (!existingEmail) {
      console.warn(`Email with Message-Id ${messageId} not found.`);
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: existingEmail.userId },
    });

    if (!user) {
      console.warn(`User with ID ${existingEmail.userId} not found.`);
      return;
    }

    await sendDeliveryConfirmationEmail(user);
    await prisma.email.update({
      where: { mailgunId: messageId },
      data: { status: "delivered" },
    });

    console.log(`Email delivered: ${messageId}`);
  } catch (error) {
    console.error(
      `Failed to handle delivered event for Message-Id ${messageId}:`,
      error
    );
  }
}

// Define a type guard for MailgunEventData
function isMailgunEventData(data: unknown): data is MailgunEventData {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  return "event" in data;
}

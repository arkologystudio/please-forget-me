import { RTBFFormValues } from "@/lib/schemas/rtbf-form-schema";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { sendInitialRequestEmail } from "../../../client/email/mailgun";

// Instantiate Prisma Client outside the handler to prevent multiple instances in serverless environments
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    console.log("Received non-POST request:", req.method);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    console.log("Received request body:", req.body);
    const data: RTBFFormValues = req.body;

    // Start a transaction to ensure atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Upsert user: find by identifier or create if not exists
      const user = await prisma.user.upsert({
        where: { identifier: data.email },
        update: {},
        create: {
          identifier: data.email,
          email: data.email,
        },
      });

      console.log("User upserted with ID:", user.id);

      // Fetch organisations based on company slugs
      const organisations = await prisma.organisation.findMany({
        where: {
          slug: {
            in: data.companies,
          },
        },
      });
      const test = await prisma.organisation.findMany();
      console.log("Test:", test);
      console.log("Organisations:", organisations);

      if (organisations.length !== data.companies.length) {
        const foundSlugs = organisations.map((org) => org.slug);
        const notFound = data.companies.filter(
          (slug) => !foundSlugs.includes(slug)
        );
        console.error("Organisations not found:", notFound);
        throw new Error(`Organisations not found: ${notFound.join(", ")}`);
      }

      // Create a form submission linked to the user
      const formSubmission = await prisma.formSubmission.create({
        data: {
          userId: user.id,
          data: data,
        },
      });

      console.log("Form submission created with ID:", formSubmission.id);

      // Prepare to send emails and create threads
      const emailPromises = organisations.map(async (org) => {
        const emailContent = await sendInitialRequestEmail(org, data);

        const thread = await prisma.thread.create({
          data: {
            userId: user.id,
            organisationId: org.id,
            status: "open",
          },
        });

        const emailRecord = await prisma.email.create({
          data: {
            threadId: thread.id,
            sender: "user",
            content: emailContent.message,
            status: "pending",
            userId: user.id,
            mailgunId: emailContent.id,
            sentAt: new Date(),
          },
        });

        console.log(
          "Email and thread created with IDs:",
          thread.id,
          emailRecord.id
        );

        return { thread, email: emailRecord };
      });

      const emailResults = await Promise.allSettled(emailPromises);

      const failed = emailResults.filter(
        (result) => result.status === "rejected"
      );

      if (failed.length > 0) {
        console.error(
          "Failed to send some initial request emails or create threads:",
          failed
        );
        throw new Error("Failed to process some organisations.");
      }

      return { user, formSubmission };
    });

    console.log("RTBF submission completed successfully:", {
      userId: result.user.id,
      formSubmissionId: result.formSubmission.id,
      timestamp: new Date().toISOString(),
    });

    const fetchedUser = await prisma.user.findUnique({
      where: { id: result.user.id },
    });

    if (!fetchedUser) {
      throw new Error("User not found. Cannot send thread confirmation email.");
    }

    // await sendDeliveryConfirmationEmail(fetchedUser);

    res.status(200).json({ message: "Request submitted successfully" });
  } catch (error: Error | unknown) {
    console.error("Error processing request:", error);
    try {
      await prisma.failedInitiationAttempt.create({
        data: {
          errorMessage:
            error instanceof Error ? error.message : "Internal server error",
          data: req.body,
        },
      });
    } catch (logError) {
      console.error("Failed to log initiation attempt:", logError);
    }
    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  } finally {
    await prisma.$disconnect();
  }
}

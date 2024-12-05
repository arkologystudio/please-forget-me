import { RTBFFormValues } from "@/lib/schemas/rtbf-form-schema";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import {
  sendInitialRequestEmail,
  sendThreadConfirmationEmail,
} from "../../../client/email/mailgun";

// Instantiate Prisma Client outside the handler to prevent multiple instances in serverless environments
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const data: RTBFFormValues = req.body; // Explicitly type the data

    // Start a transaction to ensure atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Check if user already exists based on identifier (email)
      let user = await prisma.user.findUnique({
        where: { identifier: data.email },
      });

      if (!user) {
        // Create a new user if not existing
        user = await prisma.user.create({
          data: {
            identifier: data.email,
            email: data.email,
          },
        });

        if (!user) {
          throw new Error("User not created");
        }
      }

      // Fetch all organisations based on company slugs
      const organisations = await prisma.organisation.findMany({
        where: {
          slug: {
            in: data.companies,
          },
        },
      });

      if (organisations.length !== data.companies.length) {
        const foundSlugs = organisations.map((org) => org.slug);
        const notFound = data.companies.filter(
          (slug) => !foundSlugs.includes(slug)
        );
        throw new Error(`Organisations not found: ${notFound.join(", ")}`);
      }

      // Prepare to send emails and create threads
      const emailPromises = organisations.map(async (org) => {
        // Send initial request email
        const emailContent = await sendInitialRequestEmail(org, data);

        // Create a thread for this organisation
        const thread = await prisma.thread.create({
          data: {
            userId: user.id,
            organisationId: org.id,
            status: "open",
          },
        });

        // Create an email record linked to the thread
        const emailRecord = await prisma.email.create({
          data: {
            threadId: thread.id,
            sender: "user",
            content: emailContent.message, // Assuming sendInitialRequestEmail returns the email content
          },
        });

        return { thread, email: emailRecord };
      });

      // Create a form submission
      const formSubmission = await prisma.formSubmission.create({
        data: {
          userId: user.id,
          data: JSON.parse(JSON.stringify(data)),
        },
      });

      const emailResults = await Promise.allSettled(emailPromises);

      // Handle any failed email sends or thread creations
      const failed = emailResults.filter(
        (result) => result.status === "rejected"
      );

      if (failed.length > 0) {
        console.error(
          "Failed to send some initial request emails or create threads:",
          failed
        );
        // Depending on your requirements, you can choose to fail the transaction
        // or proceed. Here, we'll throw an error to rollback.
        throw new Error("Failed to process some organisations.");
      }

      return { user, formSubmission };
    });
    console.log("RTBF submission completed successfully:", {
      userId: result.user.id,
      formSubmissionId: result.formSubmission.id,
      timestamp: new Date().toISOString(),
    });
    const user = await prisma.user.findUnique({
      where: { id: result.user.id },
    });
    if (!user) {
      throw new Error("User not found. Cannot send thread confirmation email.");
    }
    // Send thread confirmation email
    await sendThreadConfirmationEmail(user);

    // Disconnect Prisma Client
    await prisma.$disconnect();

    res.status(200).json({ message: "Request submitted successfully" });
  } catch (error: Error | unknown) {
    console.error("Error processing request:", error);
    await prisma.failedInitiationAttempt.create({
      data: {
        errorMessage:
          error instanceof Error ? error.message : "Internal server error",
        data: req.body,
      },
    });
    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

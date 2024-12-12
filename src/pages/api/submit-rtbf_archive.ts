import { RTBFFormValues } from "@/schemas/rtbf-form-schema";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { sendDeliveryConfirmationEmail, sendRTBFMailRequest } from "../../../client/email/mailgun";
import { generateLetters, LetterOutput } from "@/schemas/rtbf-letter-template";
import { Organisation } from "../../../prisma/organisations";
 

// Instantiate Prisma Client outside the handler to prevent multiple instances in serverless environments
const prisma = new PrismaClient();

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

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
    const formValues: RTBFFormValues = req.body;
    // Start a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx: TransactionClient) => {
      // Upsert user: find by identifier or create if not exists
      const user = await tx.user.upsert({
        where: { identifier: formValues.email },
        update: {},
        create: {
          identifier: formValues.email,
          email: formValues.email,
        },
      });

      console.log("User upserted with ID:", user.id);

      // Fetch organisations based on organisation slugs
      const organisationsDB = await tx.organisation.findMany({
        where: {
          slug: {
            in: formValues.organisations,
          },
        },
      }) as Organisation[];
      const test = await tx.organisation.findMany();
      console.log("Test:", test);
      console.log("Organisations in DB:", organisationsDB);

      // if (organisationsDB.length !== formValues.organisations.length) {
      //   const foundSlugs = organisationsDB.map((org: Organisation) => org.slug);
      //   const notFound = formValues.organisations.filter(
      //     (slug) => !foundSlugs.includes(slug)
      //   );
      //   console.error("Organisations not found:", notFound);
      //   throw new Error(`Organisations not found: ${notFound.join(", ")}`);
      // }

      const targetOrganisations = organisationsDB.filter((org: Organisation) => formValues.organisations.includes(org.slug));

      // Create a form submission linked to the user
      const formSubmission = await tx.formSubmission.create({
        data: {
          userId: user.id,
          data: formValues,
        },
      });

      console.log("Form submission created with ID:", formSubmission.id);

      const letters = generateLetters(formValues); // Generate letter content for each request

      // Prepare to send emails and create threads
      const emailPromises = targetOrganisations.map(async (org: Organisation) => {
        const letter = letters.find((letter: LetterOutput) => letter.to === org.email);
        if (!letter) {
          throw new Error(`Letter not found for organisation: ${org.name}`);
        }
        
        const emailContent = await sendRTBFMailRequest(letter, formValues);
        if (!emailContent.message || !emailContent.id) {
          throw new Error("Email content is undefined");
        }

        const thread = await tx.thread.create({
          data: {
            userId: user.id,
            organisationId: org.id,
            status: "open",
          },
        });

        const emailRecord = await tx.email.create({
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

    await sendDeliveryConfirmationEmail(fetchedUser);

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

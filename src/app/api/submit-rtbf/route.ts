import { RTBFFormValues } from "@/schemas/rtbf-form-schema";
import { PrismaClient } from "@prisma/client";
import { generateLetters, LetterOutput } from "@/schemas/rtbf-letter-template";
import { Organisation } from "@prisma/client";
import { NextResponse } from "next/server";
import { sendDeliveryConfirmationEmail, sendRTBFMailRequest } from "../../../../client/email/mailgun";

// Instantiate Prisma Client outside the handler to prevent multiple instances in serverless environments
const prisma = new PrismaClient();

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export async function POST(request: Request) {
  try {
    const formValues: RTBFFormValues = await request.json();
    console.log("Received request body:", formValues);

    // Start a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx: TransactionClient) => {

      const user = await tx.user.upsert({
        where: { identifier: formValues.email },
        update: {},
        create: {
          identifier: formValues.email,
          email: formValues.email,
        },
      });

      console.log("User upserted with ID:", user.id);

      const organisationsDB = await tx.organisation.findMany({
        where: {
          slug: {
            in: formValues.organisations,
          },
        },
      }) as Organisation[];

      const targetOrganisations = organisationsDB.filter((org: Organisation) => 
        formValues.organisations.includes(org.slug)
      );

      const formSubmission = await tx.formSubmission.create({
        data: {
          userId: user.id,
          data: formValues,
        },
      });

      console.log("Form submission created with ID:", formSubmission.id);

      const letters = generateLetters(formValues);

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

        return { thread, email: emailRecord };
      });

      const emailResults = await Promise.allSettled(emailPromises);
      const failed = emailResults.filter((result) => result.status === "rejected");

      if (failed.length > 0) {
        console.error("Failed to send some initial request emails or create threads:", failed);
        throw new Error("Failed to process some organisations.");
      }

      return { user, formSubmission };
    });

    // Send confirmation email
    const fetchedUser = await prisma.user.findUnique({
      where: { id: result.user.id },
    });

    if (!fetchedUser) {
      throw new Error("User not found. Cannot send thread confirmation email.");
    }

    await sendDeliveryConfirmationEmail(fetchedUser);

    return NextResponse.json({ message: "Request submitted successfully" });

  } catch (error: Error | unknown) {
    console.error("Error processing request:", error);
    try {
    const formValues: RTBFFormValues = await request.json();

      await prisma.failedInitiationAttempt.create({
        data: {
          errorMessage: error instanceof Error ? error.message : "Internal server error",
          data: formValues,
        },
      });
    } catch (logError) {
      console.error("Failed to log initiation attempt:", logError);
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );

  } finally {
    await prisma.$disconnect();
  }
} 
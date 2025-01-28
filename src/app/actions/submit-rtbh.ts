"use server";

import { RTBHFormValues } from "@/schemas/rtbh-form-schema";
import {
  sendDeliveryConfirmationEmail,
  sendMailRequest,
} from "../../client/email/mailgun";
import { generateRtbhLetters } from "@/schemas/rtbh-letter-template";
import { Organisation } from "@prisma/client";
import { prisma, TransactionClient, SubmitResult } from "@/utils/prismaClient";
import { LetterOutput } from "@/types/general";

export const submitRTBH = async (
  formValues: RTBHFormValues
): Promise<SubmitResult> => {
  try {
    console.log("Starting transaction for RTBF submission");

    const result = await prisma.$transaction(async (tx: TransactionClient) => {
      console.log("Upserting user");
      const user = await tx.user.upsert({
        where: { identifier: formValues.email },
        update: {},
        create: {
          identifier: formValues.email,
          email: formValues.email,
        },
      });

      console.log("Fetching organisations");
      const organisationsDB = await tx.organisation.findMany({
        where: {
          slug: {
            in: formValues.organisations,
          },
        },
      });

      const targetOrganisations = organisationsDB.filter((org: Organisation) =>
        formValues.organisations.includes(org.slug)
      );

      console.log("Creating form submission");
      const formSubmission = await tx.formSubmission.create({
        data: {
          userId: user.id,
          data: formValues,
        },
      });

      console.log("Generating letters");
      const letters = generateRtbhLetters(formValues);

      console.log("Sending emails and creating threads");
      const emailPromises = targetOrganisations.map(
        async (org: Organisation) => {
          const letter = letters.find(
            (letter: LetterOutput) => letter.to === org.email
          );
          if (!letter) {
            throw new Error(`Letter not found for organisation: ${org.name}`);
          }

          const emailContent = await sendMailRequest(letter, formValues);
          if (!emailContent.message || !emailContent.id) {
            throw new Error("Email content is undefined");
          }

          console.log(`Creating thread for organisation: ${org.name}`);
          const thread = await tx.thread.create({
            data: {
              userId: user.id,
              organisationId: org.id,
              status: "open",
            },
          });

          console.log(`Creating email record for organisation: ${org.name}`);
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
            `Email record created with Mailgun ID: ${emailContent.id}`
          );
          return { thread, email: emailRecord };
        }
      );

      const emailResults = await Promise.allSettled(emailPromises);
      const failed = emailResults.filter(
        (result) => result.status === "rejected"
      );

      if (failed.length > 0) {
        console.error("Failed to process some organisations.");
        throw new Error("Failed to process some organisations.");
      }

      return { user, formSubmission };
    });

    console.log("Sending confirmation email");
    const fetchedUser = await prisma.user.findUnique({
      where: { id: result.user.id },
    });

    if (!fetchedUser) {
      throw new Error("User not found. Cannot send thread confirmation email.");
    }

    if (process.env.NEXT_PUBLIC_IS_DEV === "true") {
      console.log("Skipping delivery confirmation email in development mode");
    } else {
      await sendDeliveryConfirmationEmail(
        fetchedUser,
        "Right to Be Hidden from Model Outputs"
      );
    }

    console.log("Request submitted successfully");
    return { success: true, message: "Request submitted successfully" };
  } catch (error) {
    console.error("Error processing request:", error);
    try {
      await prisma.failedInitiationAttempt.create({
        data: {
          errorMessage:
            error instanceof Error ? error.message : "Internal server error",
          data: formValues,
        },
      });
    } catch (logError) {
      console.error("Failed to log initiation attempt:", logError);
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  } finally {
    console.log("Disconnecting Prisma client");
    await prisma.$disconnect();
  }
};

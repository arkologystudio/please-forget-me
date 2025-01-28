"use server";

import { PrismaClient } from "@prisma/client";
import { sendVerificationEmail } from "../../client/email/mailgun";
import { generateVerificationCode } from "@/lib/utils";

type VerificationResult = {
  success: boolean;
  error?: string;
};

export const requestEmailVerification = async (
  email: string
): Promise<VerificationResult> => {
  const prisma = new PrismaClient();
  console.log(`Requesting email verification for: ${email}`);

  try {
    let user;
    // Lookup the user by email
    const maybeUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!maybeUser) {
      console.log(`User not found, creating new user for email: ${email}`);
      user = await prisma.user.create({
        data: { email: email, identifier: email },
      });
    } else {
      console.log(`User found for email: ${email}`);
      user = maybeUser;
    }

    // Generate code and expiration
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min from now
    console.log(`Generated verification code for email: ${email}`);

    // Store in DB
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        code: code,
        expiresAt: expiresAt,
      },
    });
    console.log(`Stored verification token for email: ${email}`);

    // Send the code via Mailgun
    await sendVerificationEmail(email, code);
    console.log(`Sent verification email to: ${email}`);

    return { success: true };
  } catch (error) {
    console.error("Error in email verification:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

export const verifyEmailCode = async (
  email: string,
  code: string
): Promise<VerificationResult> => {
  const prisma = new PrismaClient();
  console.log(`Verifying email code for: ${email}`);

  try {
    // Find user
    const user = await prisma.user.findUnique({ where: { email: email } });
    if (!user) {
      console.error(`User not found for email: ${email}`);
      throw new Error("User not found.");
    }
    console.log(`User found for email: ${email}`);

    // Find token
    const token = await prisma.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        code: code,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!token) {
      console.error(`Invalid or expired code for email: ${email}`);
      throw new Error("Invalid or expired code.");
    }
    console.log(`Valid token found for email: ${email}`);

    // Mark the token as used
    await prisma.emailVerificationToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    });
    console.log(`Marked token as used for email: ${email}`);

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { verified: true },
    });
    console.log(`User verified for email: ${email}`);

    return { success: true };
  } catch (error) {
    console.error("Error in email verification:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

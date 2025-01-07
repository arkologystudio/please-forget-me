"use server";

import { PrismaClient } from "@prisma/client";
import { sendVerificationEmail } from "../../../client/email/mailgun";
import { generateVerificationCode } from "@/lib/utils";

type VerificationResult = {
  success: boolean;
  error?: string;
};

export const requestEmailVerification = async (
  email: string
): Promise<VerificationResult> => {
  const prisma = new PrismaClient();

  try {
    let user;
    // Lookup the user by email
    const maybeUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!maybeUser) {
      user = await prisma.user.create({
        data: { email: email, identifier: email },
      });
    } else {
      user = maybeUser;
    }

    // Generate code and expiration
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min from now

    // Store in DB
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        code: code,
        expiresAt: expiresAt,
      },
    });

    // Send the code via Mailgun
    await sendVerificationEmail(email, code);

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

  try {
    // Find user
    const user = await prisma.user.findUnique({ where: { email: email } });
    if (!user) {
      throw new Error("User not found.");
    }

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
      throw new Error("Invalid or expired code.");
    }

    // Mark the token as used
    await prisma.emailVerificationToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    });

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { verified: true },
    });

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

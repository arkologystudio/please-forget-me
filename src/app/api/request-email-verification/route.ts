import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendVerificationEmail } from "../../../client/email/mailgun";
import { generateVerificationCode } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { userEmail } = await request.json();
    const prisma = new PrismaClient();

    // Lookup the user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
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
    await sendVerificationEmail(userEmail, code);

    return NextResponse.json({ message: "Verification code sent." });
  } catch (error) {
    console.error("Error in email verification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

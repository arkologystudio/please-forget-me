import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const { userEmail, code } = await request.json();
    const prisma = new PrismaClient();

    // Find user
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
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
      return NextResponse.json(
        { error: "Invalid or expired code." },
        { status: 400 }
      );
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

    return NextResponse.json({ message: "Email verified successfully." });
  } catch (error) {
    console.error('Error in email verification:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
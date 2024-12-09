import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userEmail, code } = req.body;
  const prisma = new PrismaClient();

  // Find user
  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) {
    return res.status(404).json({ error: "User not found." });
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
    return res.status(400).json({ error: "Invalid or expired code." });
  }

  // Mark the token as used
  await prisma.emailVerificationToken.update({
    where: { id: token.id },
    data: { usedAt: new Date() },
  });

  // Here you can mark user as verified
  // If you want to store a "verified" flag in user model, you can add a field like:
  // verified Boolean @default(false) in the User model
  // and update it here:
  await prisma.user.update({
    where: { id: user.id },
    data: { verified: true },
  });

  return res.status(200).json({ message: "Email verified successfully." });
}

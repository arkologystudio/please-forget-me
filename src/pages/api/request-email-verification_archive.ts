import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { sendVerificationEmail } from "../../client/email/mailgun";
import { generateVerificationCode } from "@/lib/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userEmail } = req.body;
  const prisma = new PrismaClient();

  // Lookup the user by email
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  // Generate code and expiration
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 30 min from now

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

  return res.status(200).json({ message: "Verification code sent." });
}

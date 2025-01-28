import { PrismaClient } from "@prisma/client";

// Instantiate Prisma Client
export const prisma = new PrismaClient();

export type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export type SubmitResult = {
  success: boolean;
  error?: string;
  message?: string;
};

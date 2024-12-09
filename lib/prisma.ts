// lib/prisma.ts

import { PrismaClient } from "@prisma/client";

export const getPrismaClient = () => new PrismaClient();

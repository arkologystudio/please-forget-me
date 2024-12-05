-- CreateTable
CREATE TABLE "FailedInitiationAttempt" (
    "id" SERIAL NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FailedInitiationAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateEnum
CREATE TYPE "InterestRole" AS ENUM ('CUSTOMER', 'BUSINESS');

-- CreateTable
CREATE TABLE "Interest" (
    "id" TEXT NOT NULL,
    "role" "InterestRole" NOT NULL,
    "city" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "email" TEXT,
    "postcode" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Interest_city_role_createdAt_idx" ON "Interest"("city", "role", "createdAt");

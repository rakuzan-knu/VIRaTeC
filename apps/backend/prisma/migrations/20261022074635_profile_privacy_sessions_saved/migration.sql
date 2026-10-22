-- CreateEnum
CREATE TYPE "StudyLevel" AS ENUM ('BACHELOR', 'MASTER', 'PHD', 'FACULTY', 'RESEARCHER', 'OTHER');

-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('PUBLIC', 'MEMBERS', 'PRIVATE');

-- CreateEnum
CREATE TYPE "SavedItemKind" AS ENUM ('PUBLICATION', 'PROJECT');

-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "userAgent" TEXT;

UPDATE "refresh_tokens" SET "sessionId" = "id" WHERE "sessionId" IS NULL;

ALTER TABLE "refresh_tokens" ALTER COLUMN "sessionId" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "country" TEXT,
ADD COLUMN     "institution" TEXT,
ADD COLUMN     "languages" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "links" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "openTo" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "showEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "studyLevel" "StudyLevel",
ADD COLUMN     "studyYear" INTEGER,
ADD COLUMN     "visibility" "ProfileVisibility" NOT NULL DEFAULT 'MEMBERS';

-- CreateTable
CREATE TABLE "saved_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "SavedItemKind" NOT NULL,
    "refId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "saved_items_userId_kind_refId_key" ON "saved_items"("userId", "kind", "refId");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_sessionId_idx" ON "refresh_tokens"("userId", "sessionId");

-- AddForeignKey
ALTER TABLE "saved_items" ADD CONSTRAINT "saved_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "PublicationType" AS ENUM ('PAPER', 'NEWS', 'EVENT', 'MEDIA');

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_leadId_fkey";

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "translations" JSONB,
ALTER COLUMN "leadId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "translations" JSONB;

-- CreateTable
CREATE TABLE "publications" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "PublicationType" NOT NULL,
    "year" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "readMoreLink" BOOLEAN NOT NULL DEFAULT false,
    "coverKey" TEXT,
    "sourceUrl" TEXT,
    "pdfUrl" TEXT,
    "detailSource" TEXT,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "publications_slug_key" ON "publications"("slug");

-- CreateIndex
CREATE INDEX "publications_position_idx" ON "publications"("position");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


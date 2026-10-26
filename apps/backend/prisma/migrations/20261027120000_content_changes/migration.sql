-- CreateEnum
CREATE TYPE "ContentResourceType" AS ENUM ('ENTRY', 'ASSET', 'PROJECT', 'EVENT', 'PUBLICATION');

-- CreateTable
CREATE TABLE "content_changes" (
    "id" TEXT NOT NULL,
    "resourceType" "ContentResourceType" NOT NULL,
    "resourceId" TEXT NOT NULL,
    "contentTypeId" TEXT,
    "label" TEXT,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "fieldIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "draft" JSONB,
    "baseUpdatedAt" TIMESTAMP(3),
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_cache_state" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_cache_state_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_changes_updatedAt_idx" ON "content_changes"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "content_changes_resourceType_resourceId_key" ON "content_changes"("resourceType", "resourceId");

-- AddForeignKey
ALTER TABLE "content_changes" ADD CONSTRAINT "content_changes_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


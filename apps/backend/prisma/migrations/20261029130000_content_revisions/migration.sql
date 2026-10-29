-- CreateTable
CREATE TABLE "content_revisions" (
    "id" TEXT NOT NULL,
    "resourceType" "ContentResourceType" NOT NULL,
    "resourceId" TEXT NOT NULL,
    "contentTypeId" TEXT,
    "label" TEXT,
    "data" JSONB NOT NULL,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_revisions_resourceType_resourceId_createdAt_idx" ON "content_revisions"("resourceType", "resourceId", "createdAt");

-- AddForeignKey
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

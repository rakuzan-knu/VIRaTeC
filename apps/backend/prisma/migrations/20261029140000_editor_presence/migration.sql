-- CreateTable
CREATE TABLE "editor_presence" (
    "userId" TEXT NOT NULL,
    "resourceKey" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "editor_presence_pkey" PRIMARY KEY ("userId","resourceKey")
);

-- CreateIndex
CREATE INDEX "editor_presence_resourceKey_updatedAt_idx" ON "editor_presence"("resourceKey", "updatedAt");

-- AddForeignKey
ALTER TABLE "editor_presence" ADD CONSTRAINT "editor_presence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "content_translations" (
    "id" TEXT NOT NULL,
    "resourceKey" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "valueHash" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "content_translations_resourceKey_locale_path_key" ON "content_translations"("resourceKey", "locale", "path");

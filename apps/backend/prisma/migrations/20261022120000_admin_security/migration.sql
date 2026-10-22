-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('NONE', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "AdminPermission" AS ENUM ('DASHBOARD_VIEW', 'USERS_VIEW', 'USERS_MANAGE', 'CONTENT_VIEW', 'CONTENT_EDIT', 'CONTENT_PUBLISH', 'EVENTS_MANAGE', 'MEDIA_MANAGE', 'AUDIT_VIEW');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "permissions" "AdminPermission"[] DEFAULT ARRAY[]::"AdminPermission"[],
ADD COLUMN     "staffExpiresAt" TIMESTAMP(3),
ADD COLUMN     "staffRole" "StaffRole" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorLastStep" INTEGER,
ADD COLUMN     "twoFactorPendingSecret" TEXT,
ADD COLUMN     "twoFactorSecret" TEXT;

-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "elevatedUntil" TIMESTAMP(3),
ADD COLUMN     "mfaVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "backup_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backup_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mfa_challenges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mfa_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit_buckets" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "backup_codes_userId_idx" ON "backup_codes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "mfa_challenges_tokenHash_key" ON "mfa_challenges"("tokenHash");

-- CreateIndex
CREATE INDEX "mfa_challenges_userId_idx" ON "mfa_challenges"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- AddForeignKey
ALTER TABLE "backup_codes" ADD CONSTRAINT "backup_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mfa_challenges" ADD CONSTRAINT "mfa_challenges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Only one owner can exist at any time
CREATE UNIQUE INDEX "users_single_owner_idx" ON "users"("staffRole") WHERE "staffRole" = 'OWNER';

-- Refresh tokens are now stored as SHA-256 hashes; existing plaintext sessions are invalidated
DELETE FROM "refresh_tokens";

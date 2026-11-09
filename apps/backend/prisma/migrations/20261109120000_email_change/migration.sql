-- AlterEnum
ALTER TYPE "EmailTokenPurpose" ADD VALUE 'CHANGE_EMAIL';

-- AlterTable
ALTER TABLE "users" ADD COLUMN "pendingEmail" TEXT;

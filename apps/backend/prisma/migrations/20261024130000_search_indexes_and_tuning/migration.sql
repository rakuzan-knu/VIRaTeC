-- CreateExtension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- DropIndex
DROP INDEX "audit_logs_action_idx";

-- CreateIndex
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt");

-- CreateIndex
CREATE INDEX "users_name_trgm_idx" ON "users" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "users_email_trgm_idx" ON "users" USING GIN ("email" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "users_institution_trgm_idx" ON "users" USING GIN ("institution" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "users_department_trgm_idx" ON "users" USING GIN ("department" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "users_bio_trgm_idx" ON "users" USING GIN ("bio" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "users_skills_idx" ON "users" USING GIN ("skills");

-- CreateIndex
CREATE INDEX "users_openTo_idx" ON "users" USING GIN ("openTo");

-- AlterTable
ALTER TABLE "rate_limit_buckets" SET UNLOGGED;

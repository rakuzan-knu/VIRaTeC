#!/usr/bin/env bash
set -euo pipefail

echo "==> Running Prisma migration deploy..."
if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL is not set!"
  exit 1
fi

pnpm --filter @viratec/backend exec prisma migrate deploy
echo "✅ Migrations deployed successfully."

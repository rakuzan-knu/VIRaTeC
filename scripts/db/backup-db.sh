#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/viratec_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"
echo "==> Creating PostgreSQL database backup to ${BACKUP_FILE}..."

PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
  -h "${POSTGRES_HOST:-postgres}" \
  -U "${POSTGRES_USER:-viratec_user}" \
  -d "${POSTGRES_DB:-viratec_db}" \
  | gzip > "${BACKUP_FILE}"

echo "✅ Backup completed: ${BACKUP_FILE}"

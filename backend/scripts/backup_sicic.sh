#!/usr/bin/env bash
# ==============================================================================
# Script de Respaldo Automatizado - SICIZ-INSAI V2.0 (Linux / VPS)
# ==============================================================================
set -euo pipefail

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
export PGPASSWORD="${DB_PASSWORD}"

MASTER_DB="db_sicic_insai_master"
OPERATIVE_DB="db_insai_operativa"
RETENTION_DAYS=15

BACKUP_DESTINATION="${BACKUP_DESTINATION:-/opt/backups/sicic_insai}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DESTINATION}/${DATE}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "${SCRIPT_DIR}")"
UPLOADS_DIR="${BACKEND_DIR}/uploads"

mkdir -p "${BACKUP_DIR}"

echo "================================================================="
echo "INICIANDO RESPALDO INSTITUCIONAL SICIZ-INSAI V2.0"
echo "Fecha y Hora: ${DATE}"
echo "Destino: ${BACKUP_DIR}"
echo "================================================================="

# 1. Respaldo Base Master
echo "[1/4] Respaldando Base de Datos Master (${MASTER_DB})..."
pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${MASTER_DB}" -F c -b -v -f "${BACKUP_DIR}/master_${MASTER_DB}_${DATE}.dump"
echo "      Base Master respaldada correctamente."

# 2. Respaldo Base Operativa
echo "[2/4] Respaldando Base de Datos Operativa (${OPERATIVE_DB})..."
pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${OPERATIVE_DB}" -F c -b -v -f "${BACKUP_DIR}/operativa_${OPERATIVE_DB}_${DATE}.dump"
echo "      Base Operativa respaldada correctamente."

# 3. Respaldo de Roles Globales
echo "[3/4] Respaldando Roles y Usuarios Globales..."
pg_dumpall -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" --globals-only -f "${BACKUP_DIR}/pg_globals_${DATE}.sql"
echo "      Roles globales respaldados correctamente."

# 4. Respaldo de Archivos Multimedia (Uploads)
if [ -d "${UPLOADS_DIR}" ]; then
    echo "[4/4] Comprimiendo directorio uploads..."
    tar -czf "${BACKUP_DIR}/uploads_${DATE}.tar.gz" -C "${BACKEND_DIR}" uploads
    echo "      Uploads comprimidos en: ${BACKUP_DIR}/uploads_${DATE}.tar.gz"
else
    echo "[4/4] Directorio uploads no encontrado, omitiendo..."
fi

# 5. Aplicar Politica de Retencion
echo "-----------------------------------------------------------------"
echo "Aplicando politica de retencion (${RETENTION_DAYS} dias)..."
find "${BACKUP_DESTINATION}" -mindepth 1 -maxdepth 1 -type d -mtime "+${RETENTION_DAYS}" -exec rm -rf {} +

unset PGPASSWORD
echo "================================================================="
echo "RESPALDO COMPLETADO EXITOSAMENTE: ${DATE}"
echo "================================================================="


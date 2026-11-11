# ==============================================================================
# Script de Respaldo Automatizado - SICIZ-INSAI V2.0 (Windows PowerShell)
# ==============================================================================

param(
    [string]$DbUser = "postgres",
    [string]$DbPassword = "postgres",
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432,
    [string]$BackupDestination = "D:\Respaldos_SICIC",
    [int]$RetentionDays = 15
)

$ErrorActionPreference = "Stop"

# Detectar binario de PostgreSQL
$PossiblePaths = @(
    "C:\Program Files\PostgreSQL\16\bin",
    "C:\Program Files\PostgreSQL\15\bin",
    "C:\Program Files\PostgreSQL\14\bin",
    "C:\Program Files\PostgreSQL\17\bin"
)

$PG_BIN = $null
foreach ($path in $PossiblePaths) {
    if (Test-Path "$path\pg_dump.exe") {
        $PG_BIN = $path
        break
    }
}

if (-not $PG_BIN) {
    # Intentar buscar en PATH global
    $cmd = Get-Command "pg_dump.exe" -ErrorAction SilentlyContinue
    if ($cmd) {
        $PG_BIN = Split-Path $cmd.Source
    } else {
        Write-Error "[ERROR] No se encontro pg_dump.exe en las rutas estandar de PostgreSQL."
        exit 1
    }
}

$env:PGPASSWORD = $DbPassword

$DATE = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_DIR = Join-Path $BackupDestination $DATE
$MASTER_DB = "db_sicic_insai_master"
$OPERATIVE_DB = "db_insai_operativa"

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND_DIR = Split-Path -Parent $SCRIPT_DIR
$UPLOADS_DIR = Join-Path $BACKEND_DIR "uploads"

if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null
}

Write-Host "================================================================="
Write-Host "INICIANDO RESPALDO INSTITUCIONAL SICIZ-INSAI V2.0"
Write-Host "Fecha y Hora: $DATE"
Write-Host "Destino: $BACKUP_DIR"
Write-Host "================================================================="

# 1. Respaldo Base Master
$MasterBackup = Join-Path $BACKUP_DIR "master_${MASTER_DB}_${DATE}.dump"
Write-Host "[1/4] Respaldando Base de Datos Master ($MASTER_DB)..."
& "$PG_BIN\pg_dump.exe" -h $DbHost -p $DbPort -U $DbUser -d $MASTER_DB -F c -b -v -f $MasterBackup
Write-Host "      Base Master respaldada correctamente."

# 2. Respaldo Base Operativa
$OperativeBackup = Join-Path $BACKUP_DIR "operativa_${OPERATIVE_DB}_${DATE}.dump"
Write-Host "[2/4] Respaldando Base de Datos Operativa ($OPERATIVE_DB)..."
& "$PG_BIN\pg_dump.exe" -h $DbHost -p $DbPort -U $DbUser -d $OPERATIVE_DB -F c -b -v -f $OperativeBackup
Write-Host "      Base Operativa respaldada correctamente."

# 3. Respaldo de Roles Globales
$GlobalsBackup = Join-Path $BACKUP_DIR "pg_globals_${DATE}.sql"
Write-Host "[3/4] Respaldando Roles y Usuarios Globales..."
& "$PG_BIN\pg_dumpall.exe" -h $DbHost -p $DbPort -U $DbUser --globals-only -f $GlobalsBackup
Write-Host "      Roles globales respaldados correctamente."

# 4. Respaldo de Archivos Multimedia Físicos
if (Test-Path $UPLOADS_DIR) {
    Write-Host "[4/4] Comprimiendo directorio de archivos multimedia (uploads)..."
    $UploadsZip = Join-Path $BACKUP_DIR "uploads_${DATE}.zip"
    Compress-Archive -Path "$UPLOADS_DIR\*" -DestinationPath $UploadsZip -Force
    Write-Host "      Archivos multimedia comprimidos en: $UploadsZip"
} else {
    Write-Host "[4/4] Directorio uploads no encontrado, omitiendo..."
}

# 5. Aplicar Politica de Retencion
Write-Host "-----------------------------------------------------------------"
Write-Host "Aplicando politica de retencion ($RetentionDays dias)..."
$LimitDate = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem -Path $BackupDestination -Directory | Where-Object { $_.CreationTime -lt $LimitDate } | ForEach-Object {
    Write-Host "Eliminando respaldo obsoleto: $($_.FullName)"
    Remove-Item -Path $_.FullName -Recurse -Force
}

$env:PGPASSWORD = $null
Write-Host "================================================================="
Write-Host "RESPALDO COMPLETADO EXITOSAMENTE: $DATE"
Write-Host "================================================================="


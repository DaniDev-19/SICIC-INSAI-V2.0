# Estrategia Integral de Respaldos (Backups) y Recuperación ante Desastres (Disaster Recovery)

Este documento describe la arquitectura, metodologías, herramientas, scripts y procedimientos estandarizados para la realización de copias de seguridad (respaldos) y la recuperación íntegra ante desastres del sistema SICIZ-INSAI V2.0.

---

## 1. Alcance y Arquitectura de Datos del Sistema

El sistema opera bajo un modelo de arquitectura desacoplada que requiere la protección de tres componentes fundamentales:

1. **Base de Datos Master (`db_sicic_insai_master`):**
   * Contiene usuarios globales, credenciales cifradas (bcrypt), estados de autenticación multifactor (secretos TOTP y códigos de respaldo cifrados), catálogo de sedes territoriales, roles del sistema, matriz de permisos RBAC y la bitácora inmutable de auditoría central.

2. **Bases de Datos Operativas (`db_insai_operativa`, etc.):**
   * Contiene los registros productivos por sede o instancia territorial: solicitantes, predios agrícolas/pecuarios, solicitudes de servicio, planificaciones técnicas, actas de inspección general, inspecciones de silos agroindustriales, avales zoosanitarios, inventario físico de insumos y movimientos de kardex.

3. **Archivos Físicos y Multimedia (`backend/uploads/` o Cloudflare R2):**
   * Contiene las evidencias fotográficas de inspecciones en campo, actas firmadas escaneadas, fotografías de marcas de hierros ganaderos y avatares de perfil de usuarios.

---

## 2. Tipos de Respaldo y Herramientas Oficiales

SICIZ-INSAI utiliza el motor relacional PostgreSQL (v14 a v16+). Se establecen dos modalidades principales de respaldo lógico:

### 2.1. Formato Binario Comprimido Custom (`-Fc`) - Recomendado para Producción
* Generado mediante la utilidad oficial `pg_dump` con el parámetro `-F c`.
* **Ventajas:**
  * Compresión nativa zlib (reduce el tamaño en más de un 70%).
  * Permite restauraciones selectivas de tablas o esquemas individuales usando `pg_restore`.
  * Habilita restauración multihilo concurrente (`-j 4`) para reducir drásticamente el tiempo de inactividad (RTO).
  * Incluye metadatos de dependencias para restaurar llaves foráneas y disparadores en el orden exacto.

### 2.2. Formato Texto Plano SQL (`-Fp`) - Para Auditoría o Migración de Versión
* Generado con `pg_dump -F p` produciendo un archivo `.sql` estándar.
* **Ventajas:** Legible por humanos, editable con cualquier editor de texto y restaurable mediante la utilidad `psql`.

---

## 3. Comandos Manuales de Respaldo

A continuación se detallan los comandos estándar para ejecución directa desde la terminal o consola administrativa:

### 3.1. Respaldo de Base de Datos Master
```bash
# Formato Custom Comprimido (.dump)
pg_dump -h localhost -p 5432 -U postgres -d db_sicic_insai_master -F c -b -v -f "respaldo_master_$(date +%Y%m%d_%H%M%S).dump"

# Formato SQL Plano (.sql)
pg_dump -h localhost -p 5432 -U postgres -d db_sicic_insai_master -F p --clean --if-exists -v -f "respaldo_master_$(date +%Y%m%d_%H%M%S).sql"
```

### 3.2. Respaldo de Base de Datos Operativa
```bash
# Formato Custom Comprimido (.dump)
pg_dump -h localhost -p 5432 -U postgres -d db_insai_operativa -F c -b -v -f "respaldo_operativa_$(date +%Y%m%d_%H%M%S).dump"

# Formato SQL Plano (.sql)
pg_dump -h localhost -p 5432 -U postgres -d db_insai_operativa -F p --clean --if-exists -v -f "respaldo_operativa_$(date +%Y%m%d_%H%M%S).sql"
```

### 3.3. Respaldo Global de Roles y Usuarios de PostgreSQL
Para salvaguardar los usuarios del motor de base de datos y sus privilegios globales a nivel de clúster:
```bash
pg_dumpall -h localhost -p 5432 -U postgres --globals-only -f "respaldo_pg_globals_$(date +%Y%m%d_%H%M%S).sql"
```

### 3.4. Respaldo de Archivos Multimedia Físicos (`uploads/`)
En entornos locales donde las imágenes se guardan en disco:
```bash
# En Linux
tar -czvf "respaldo_uploads_$(date +%Y%m%d_%H%M%S).tar.gz" -C backend uploads/

# En Windows (PowerShell)
Compress-Archive -Path "backend\uploads" -DestinationPath "respaldo_uploads_$(Get-Date -Format 'yyyyMMdd_HHmmss').zip" -Force
```

---

## 4. Automatización de Respaldos

Para garantizar la continuidad operativa, los respaldos deben ejecutarse de manera programada sin intervención manual.

### 4.1. Script Automatizado para Servidores Windows (`backup_sicic.ps1`)

Crea el archivo `backend/scripts/backup_sicic.ps1`:

```powershell
# Script de Respaldo Automatizado SICIZ-INSAI V2.0 (Windows Server)
$ErrorActionPreference = "Stop"

# Configuracion General
$PG_BIN = "C:\Program Files\PostgreSQL\16\bin"
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_USER = "postgres"
$env:PGPASSWORD = "tu_password_aqui"

$MASTER_DB = "db_sicic_insai_master"
$OPERATIVE_DB = "db_insai_operativa"

$BACKUP_ROOT = "D:\Respaldos_SICIC"
$DATE = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_DIR = "$BACKUP_ROOT\$DATE"
$UPLOADS_DIR = "D:\Escritorio\SICIC-INSAI-V2.0\backend\uploads"

# 1. Crear Directorio de Respaldo
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null
}

Write-Host "[INFO] Iniciando respaldo de bases de datos SICIZ-INSAI: $DATE"

# 2. Respaldo Master (Custom Comprimido)
$MASTER_FILE = "$BACKUP_DIR\master_${MASTER_DB}_$DATE.dump"
& "$PG_BIN\pg_dump.exe" -h $DB_HOST -p $DB_PORT -U $DB_USER -d $MASTER_DB -F c -b -v -f $MASTER_FILE
Write-Host "[OK] Base Master respaldada: $MASTER_FILE"

# 3. Respaldo Operativa (Custom Comprimido)
$OPERATIVE_FILE = "$BACKUP_DIR\operativa_${OPERATIVE_DB}_$DATE.dump"
& "$PG_BIN\pg_dump.exe" -h $DB_HOST -p $DB_PORT -U $DB_USER -d $OPERATIVE_DB -F c -b -v -f $OPERATIVE_FILE
Write-Host "[OK] Base Operativa respaldada: $OPERATIVE_FILE"

# 4. Respaldo de Roles Globales
$GLOBALS_FILE = "$BACKUP_DIR\pg_globals_$DATE.sql"
& "$PG_BIN\pg_dumpall.exe" -h $DB_HOST -p $DB_PORT -U $DB_USER --globals-only -f $GLOBALS_FILE
Write-Host "[OK] Roles globales respaldados: $GLOBALS_FILE"

# 5. Respaldo de Archivos Multimedia (Uploads)
if (Test-Path $UPLOADS_DIR) {
    $UPLOADS_ZIP = "$BACKUP_DIR\uploads_$DATE.zip"
    Compress-Archive -Path "$UPLOADS_DIR\*" -DestinationPath $UPLOADS_ZIP -Force
    Write-Host "[OK] Directorio de uploads comprimido: $UPLOADS_ZIP"
}

# 6. Politica de Retencion (Eliminar respaldos con mas de 15 dias)
$DIAS_RETENCION = 15
$LIMITE = (Get-Date).AddDays(-$DIAS_RETENCION)
Get-ChildItem -Path $BACKUP_ROOT -Directory | Where-Object { $_.CreationTime -lt $LIMITE } | ForEach-Object {
    Write-Host "[INFO] Eliminando respaldo antiguo por retencion: $($_.FullName)"
    Remove-Item -Path $_.FullName -Recurse -Force
}

$env:PGPASSWORD = $null
Write-Host "[EXITO] Respaldo finalizado correctamente."
```

### 4.2. Script Automatizado para Servidores Linux (`backup_sicic.sh`)

Crea el archivo `backend/scripts/backup_sicic.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Configuracion
PGHOST="localhost"
PGPORT="5432"
PGUSER="postgres"
export PGPASSWORD="tu_password_aqui"

MASTER_DB="db_sicic_insai_master"
OPERATIVE_DB="db_insai_operativa"

BACKUP_ROOT="/opt/backups/sicic_insai"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_ROOT}/${DATE}"
UPLOADS_DIR="/var/www/sicic-insai-v2.0/backend/uploads"

mkdir -p "${BACKUP_DIR}"
echo "[INFO] Iniciando respaldo en: ${BACKUP_DIR}"

# 1. Respaldo Base Master
pg_dump -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${MASTER_DB}" -F c -b -v -f "${BACKUP_DIR}/master_${MASTER_DB}_${DATE}.dump"

# 2. Respaldo Base Operativa
pg_dump -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${OPERATIVE_DB}" -F c -b -v -f "${BACKUP_DIR}/operativa_${OPERATIVE_DB}_${DATE}.dump"

# 3. Respaldo Globales
pg_dumpall -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" --globals-only -f "${BACKUP_DIR}/pg_globals_${DATE}.sql"

# 4. Respaldo Uploads
if [ -d "${UPLOADS_DIR}" ]; then
  tar -czf "${BACKUP_DIR}/uploads_${DATE}.tar.gz" -C "${UPLOADS_DIR}" .
fi

# 5. Politica de Retencion (Eliminar carpetas de mas de 15 dias)
find "${BACKUP_ROOT}" -mindepth 1 -maxdepth 1 -type d -mtime +15 -exec rm -rf {} +

unset PGPASSWORD
echo "[EXITO] Respaldo completado satisfactoriamente."
```

Dar permisos de ejecución en Linux:
```bash
chmod +x backend/scripts/backup_sicic.sh
```

---

## 5. Programación de Tareas Automáticas

### 5.1. En Windows (Programador de Tareas)
1. Abrir **Programador de Tareas** (`taskschd.msc`).
2. Crear Tarea Básica:
   * **Nombre:** `SICIZ_INSAI_Respaldo_Diario`.
   * **Desencadenador:** Diariamente a las `02:00:00`.
   * **Acción:** Iniciar un programa.
   * **Programa o script:** `powershell.exe`
   * **Argumentos:** `-ExecutionPolicy Bypass -File "D:\Escritorio\SICIC-INSAI-V2.0\backend\scripts\backup_sicic.ps1"`
3. En las propiedades de la tarea, marcar: **Ejecutar tanto si el usuario inició sesión como si no** y **Ejecutar con los privilegios más altos**.

Alternativamente por línea de comandos (como Administrador):
```cmd
schtasks /create /tn "SICIZ_INSAI_Respaldo_Diario" /tr "powershell.exe -ExecutionPolicy Bypass -File D:\Escritorio\SICIC-INSAI-V2.0\backend\scripts\backup_sicic.ps1" /sc daily /st 02:00 /ru SYSTEM /rl HIGHEST
```

### 5.2. En Linux (Cron Daemon)
Editar el crontab del usuario root o postgres:
```bash
crontab -e
```
Agregar la siguiente línea para ejecutar todos los días a las 02:00 AM:
```cron
0 2 * * * /opt/backups/sicic_insai/backup_sicic.sh >> /var/log/sicic_backup.log 2>&1
```

---

## 6. Procedimiento Paso a Paso de Restauración (Disaster Recovery)

Ante una falla de hardware, corrupción de datos o migración a un servidor nuevo, siga este procedimiento estricto:

### Paso 1: Detener el Servicio Backend
Para evitar que se generen transacciones inconsistentes durante la restauración:
```bash
# Si se usa PM2
pm2 stop sicic-backend

# Si se usa Systemd
sudo systemctl stop sicic-backend
```

### Paso 2: Finalizar Conexiones Activas a las Bases de Datos
PostgreSQL no permite eliminar o restaurar en caliente si existen clientes conectados. Ejecutar en `psql`:
```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname IN ('db_sicic_insai_master', 'db_insai_operativa')
  AND pid <> pg_backend_pid();
```

### Paso 3: Recrear las Bases de Datos Vacías
```bash
# Eliminar bases de datos existentes
dropdb -h localhost -p 5432 -U postgres --if-exists db_sicic_insai_master
dropdb -h localhost -p 5432 -U postgres --if-exists db_insai_operativa

# Crear bases de datos limpias con codificacion UTF8
createdb -h localhost -p 5432 -U postgres -E UTF8 -O postgres db_sicic_insai_master
createdb -h localhost -p 5432 -U postgres -E UTF8 -O postgres db_insai_operativa
```

### Paso 4: Restaurar desde los Archivos `.dump`

Utilizar `pg_restore` especificando la base de datos de destino:

```bash
# 1. Restaurar Base Master
pg_restore -h localhost -p 5432 -U postgres -d db_sicic_insai_master -v --no-owner --no-privileges "D:\Respaldos_SICIC\20261110_020000\master_db_sicic_insai_master_20261110_020000.dump"

# 2. Restaurar Base Operativa
pg_restore -h localhost -p 5432 -U postgres -d db_insai_operativa -v --no-owner --no-privileges "D:\Respaldos_SICIC\20261110_020000\operativa_db_insai_operativa_20261110_020000.dump"
```

Parámetros explicados:
* `-v` (`--verbose`): Muestra el progreso detallado de objetos y registros restaurados.
* `--no-owner`: Omite comandos de asignación de propietario original, adaptándose al usuario local.
* `--no-privileges`: Previene conflictos de permisos heredados en entornos distintos.

### Paso 5: Restaurar Archivos Multimedia (`uploads/`)

```bash
# En Windows (PowerShell)
Expand-Archive -Path "D:\Respaldos_SICIC\20261110_020000\uploads_20261110_020000.zip" -DestinationPath "D:\Escritorio\SICIC-INSAI-V2.0\backend\uploads" -Force

# En Linux
tar -xzf "/opt/backups/sicic_insai/20261110_020000/uploads_20261110_020000.tar.gz" -C "/var/www/sicic-insai-v2.0/backend/uploads"
```

### Paso 6: Verificación de Integridad Post-Restauración

Antes de reiniciar el backend, verificar la coherencia con estos tres comandos:

1. **Generar Clientes Prisma Actualizados:**
   ```bash
   cd backend
   npm run prisma:generate
   ```

2. **Verificar Conteo de Tablas y Registros:**
   ```sql
   -- En db_sicic_insai_master
   \c db_sicic_insai_master
   SELECT count(*) FROM "User";
   SELECT count(*) FROM "Role";
   SELECT count(*) FROM "Instance";

   -- En db_insai_operativa
   \c db_insai_operativa
   SELECT count(*) FROM "Solicitud";
   SELECT count(*) FROM "Inspeccion";
   SELECT count(*) FROM "InspeccionSilo";
   SELECT count(*) FROM "AvalSanitario";
   SELECT count(*) FROM "Item";
   ```

3. **Verificar y Reparar Secuencias de Llaves Primarias (si fuera necesario):**
   Si se realizaron inserciones manuales, restablecer los correlativos numéricos de las tablas:
   ```sql
   -- Ejemplo para tabla Item en db_insai_operativa
   SELECT setval(pg_get_serial_sequence('"Item"', 'id'), coalesce(max(id), 1)) FROM "Item";
   SELECT setval(pg_get_serial_sequence('"Solicitud"', 'id'), coalesce(max(id), 1)) FROM "Solicitud";
   SELECT setval(pg_get_serial_sequence('"Inspeccion"', 'id'), coalesce(max(id), 1)) FROM "Inspeccion";
   ```

### Paso 7: Reiniciar el Servicio Backend
```bash
# En PM2
pm2 start sicic-backend

# En desarrollo local
npm run dev
```

Comprobar en la consola que ambos clientes Prisma (`masterPrisma` y `tenantPrisma`) se conecten sin advertencias y responder a peticiones `GET /api/auth/me`.

---

## 7. Estrategia de Respaldo en la Nube y Off-Site (Cloudflare R2 / S3)

Para cumplir con el estándar de seguridad 3-2-1 (3 copias de los datos, 2 medios diferentes, 1 copia fuera de sitio):

### 7.1. Sincronización Automática con `rclone` hacia Cloudflare R2
1. Instalar `rclone` en el servidor.
2. Configurar el endpoint de Cloudflare R2 con las credenciales S3 API:
   ```ini
   [cloudflare_r2]
   type = s3
   provider = Cloudflare
   access_key_id = <TU_ACCESS_KEY>
   secret_access_key = <TU_SECRET_KEY>
   endpoint = https://<ACCOUNT_ID>.r2.cloudflarestorage.com
   ```
3. Agregar la sincronización al final del script de respaldo:
   ```bash
   rclone sync "${BACKUP_DIR}" "cloudflare_r2:sicic-insai-backups/${DATE}" --fast-list
   ```

### 7.2. Cifrado de Respaldos antes de Subir a la Nube
Para proteger información confidencial de productores agropecuarios y auditorías institucionales, cifrar el archivo comprimido con OpenSSL:
```bash
openssl enc -aes-256-cbc -salt -pbkdf2 -in "respaldo_operativa.dump" -out "respaldo_operativa.dump.enc" -pass pass:"ClaveSeguraInstitucional2026"
```
Para descifrar en destino:
```bash
openssl enc -d -aes-256-cbc -pbkdf2 -in "respaldo_operativa.dump.enc" -out "respaldo_operativa.dump" -pass pass:"ClaveSeguraInstitucional2026"
```

---

## 8. Políticas Institucionales de Retención (RPO y RTO)

| Parámetro | Objetivo Institucional | Estrategia de Mitigación |
| :--- | :--- | :--- |
| **RPO (Punto Objetivo de Recuperación)** | Menor a 24 horas | Respaldo automático diario a las 02:00 AM. Registro de auditoría continuo en bitácora. |
| **RTO (Tiempo Objetivo de Recuperación)** | Menor a 30 minutos | Uso de formato binario `-Fc` con `pg_restore` multihilo y scripts automatizados de reconstrucción de esquema. |
| **Retención Diaria** | 7 días continuos | Archivos `.dump` locales en servidor para restauración inmediata ante incidentes recientes. |
| **Retención Semanal** | 4 semanas | Copia consolidada de los domingos almacenada en almacenamiento secundario o R2. |
| **Retención Mensual** | 12 meses | Copia del último día de cada mes para cumplimiento normativo e histórico del INSAI. |


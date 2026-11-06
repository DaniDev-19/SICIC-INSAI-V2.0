import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import pkg from 'pg';
const { Pool } = pkg;
import { masterPrisma } from '../config/prisma.js';

const BACKUPS_DIR = fs.existsSync(path.resolve('backend'))
  ? path.resolve('backend', 'respaldos')
  : path.resolve('respaldos');
const CONFIG_FILE = path.join(BACKUPS_DIR, 'backup-config.json');

const DEFAULT_CONFIG = {
  enabled: false,
  frequency: 'daily', // 'daily' | 'weekly' | 'monthly'
  time: '02:00', // Formato 24h HH:mm
  dayOfWeek: 1, // 0 = Domingo, 1 = Lunes (para semanal)
  dayOfMonth: 1, // 1-31 (para mensual)
  targets: ['master', 'operativa'], // 'master' | 'operativa' | 'all'
  maxCopies: 10, // Rotación automática para cuidar el almacenamiento
  lastRun: null,
  lastStatus: null,
};

class BackupService {
  constructor() {
    this.ensureDirectory();
    this.schedulerInterval = null;
  }

  ensureDirectory() {
    try {
      if (!fs.existsSync(BACKUPS_DIR)) {
        fs.mkdirSync(BACKUPS_DIR, { recursive: true });
      }
      if (!fs.existsSync(CONFIG_FILE)) {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('[BackupService] Error al asegurar directorio de respaldos:', err.message);
    }
  }

  getConfiguracion() {
    try {
      this.ensureDirectory();
      if (fs.existsSync(CONFIG_FILE)) {
        const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
        return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.error('[BackupService] Error al leer configuración:', err.message);
    }
    return DEFAULT_CONFIG;
  }

  guardarConfiguracion(nuevaConfig) {
    try {
      this.ensureDirectory();
      const actual = this.getConfiguracion();
      const updated = {
        ...actual,
        ...nuevaConfig,
        maxCopies: Math.max(1, Math.min(50, Number(nuevaConfig.maxCopies) || 10)),
      };
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
      return updated;
    } catch (err) {
      console.error('[BackupService] Error al guardar configuración:', err.message);
      throw new Error('No se pudo guardar la configuración de respaldos.');
    }
  }

  resolveConnectionUrl(target, req) {
    const isProduction = process.env.NODE_ENV === 'production';
    const useStaticDb = String(process.env.USE_STATIC_DB).trim() === 'true';

    const cleanUrl = (url) => (url ? url.trim().replace(/^['"]+|['"]+$/g, '') : url);

    if (target === 'master') {
      if (process.env.MASTER_DATABASE_URL) {
        return {
          url: cleanUrl(process.env.MASTER_DATABASE_URL),
          dbName: 'db_sicic_insai_master',
          label: 'Master',
        };
      }
      const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;
      return {
        url: `postgresql://${DB_USER || 'postgres'}:${DB_PASSWORD || ''}@${DB_HOST || 'localhost'}:${DB_PORT || 5432}/db_sicic_insai_master?schema=public`,
        dbName: 'db_sicic_insai_master',
        label: 'Master',
      };
    }

    // Operativa
    const tenantDbName = req?.user?.currentInstance?.db_name || req?.dbName || 'db_insai_operativa';

    if (isProduction && useStaticDb && process.env.DATABASE_URL) {
      return {
        url: cleanUrl(process.env.DATABASE_URL),
        dbName: tenantDbName,
        label: req?.user?.currentInstance?.nombre || 'Sede Operativa',
      };
    }

    const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;
    return {
      url: `postgresql://${DB_USER || 'postgres'}:${DB_PASSWORD || ''}@${DB_HOST || 'localhost'}:${DB_PORT || 5432}/${tenantDbName}?schema=public`,
      dbName: tenantDbName,
      label: req?.user?.currentInstance?.nombre || 'Sede Operativa',
    };
  }

  getPgDumpBinaryPath() {
    if (process.env.PG_DUMP_PATH && fs.existsSync(process.env.PG_DUMP_PATH)) {
      return `"${process.env.PG_DUMP_PATH}"`;
    }

    if (process.platform === 'win32') {
      const bases = [
        'C:\\Program Files\\PostgreSQL',
        'C:\\Program Files (x86)\\PostgreSQL',
      ];
      for (const base of bases) {
        if (fs.existsSync(base)) {
          try {
            const versions = fs.readdirSync(base)
              .filter((v) => /^\d+$/.test(v))
              .sort((a, b) => Number(b) - Number(a));

            for (const ver of versions) {
              const candidate = path.join(base, ver, 'bin', 'pg_dump.exe');
              if (fs.existsSync(candidate)) {
                return `"${candidate}"`;
              }
            }
          } catch {}
        }
      }
    }

    const linuxPaths = [
      '/usr/bin/pg_dump',
      '/usr/local/bin/pg_dump',
      '/usr/lib/postgresql/17/bin/pg_dump',
      '/usr/lib/postgresql/16/bin/pg_dump',
      '/usr/lib/postgresql/15/bin/pg_dump',
    ];
    for (const p of linuxPaths) {
      if (fs.existsSync(p)) return `"${p}"`;
    }

    return 'pg_dump';
  }

  async generarRespaldoNativoConPg(connectionUrl, dbName, outputFile) {
    const poolConfig = {
      connectionString: connectionUrl,
      connectionTimeoutMillis: 10000,
    };

    if (connectionUrl.includes('sslmode=require') || connectionUrl.includes('neon.tech')) {
      poolConfig.ssl = { rejectUnauthorized: false };
    }

    const pool = new Pool(poolConfig);
    const client = await pool.connect();

    try {
      const writeStream = fs.createWriteStream(outputFile, { encoding: 'utf-8' });

      // Cabecera SQL
      const header = `-- =====================================================================
-- SICIC-INSAI V2.0 - Respaldo Estructurado de Base de Datos
-- Base de Datos: ${dbName}
-- Fecha de Generación: ${new Date().toLocaleString('es-VE')}
-- Generador: Motor Nativo SICIC-INSAI PostgreSQL Engine
-- =====================================================================

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Desactivar temporalmente disparadores y claves foráneas para permitir restauración limpia
SET session_replication_role = 'replica';

`;
      writeStream.write(header);

      // 1. Obtener todas las tablas públicas
      const tablesRes = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `);

      const tables = tablesRes.rows.map((r) => r.table_name);

      for (const table of tables) {
        writeStream.write(`\n-- ---------------------------------------------------------------------\n`);
        writeStream.write(`-- Tabla: ${table}\n`);
        writeStream.write(`-- ---------------------------------------------------------------------\n`);

        // Extraer definición de columnas para DDL
        const colRes = await client.query(`
          SELECT 
            column_name, 
            data_type, 
            udt_name,
            character_maximum_length,
            is_nullable, 
            column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position;
        `, [table]);

        if (colRes.rows.length > 0) {
          const colDefs = colRes.rows.map((c) => {
            let typeStr = c.udt_name;
            if (c.data_type === 'character varying') {
              typeStr = c.character_maximum_length ? `VARCHAR(${c.character_maximum_length})` : 'VARCHAR';
            } else if (c.data_type === 'integer') {
              typeStr = 'INTEGER';
            } else if (c.data_type === 'bigint') {
              typeStr = 'BIGINT';
            } else if (c.data_type === 'smallint') {
              typeStr = 'SMALLINT';
            } else if (c.data_type === 'boolean') {
              typeStr = 'BOOLEAN';
            } else if (c.data_type === 'text') {
              typeStr = 'TEXT';
            } else if (c.data_type === 'timestamp without time zone') {
              typeStr = 'TIMESTAMP';
            } else if (c.data_type === 'timestamp with time zone') {
              typeStr = 'TIMESTAMPTZ';
            } else if (c.data_type === 'jsonb') {
              typeStr = 'JSONB';
            } else if (c.data_type === 'json') {
              typeStr = 'JSON';
            } else if (c.data_type === 'numeric') {
              typeStr = 'NUMERIC';
            } else if (c.data_type === 'double precision') {
              typeStr = 'DOUBLE PRECISION';
            }

            let def = `  "${c.column_name}" ${typeStr}`;
            if (c.column_default) {
              def += ` DEFAULT ${c.column_default}`;
            }
            if (c.is_nullable === 'NO') {
              def += ' NOT NULL';
            }
            return def;
          });

          writeStream.write(`CREATE TABLE IF NOT EXISTS "${table}" (\n${colDefs.join(',\n')}\n);\n\n`);
        }

        // Extraer datos de la tabla
        const rowsRes = await client.query(`SELECT * FROM "${table}"`);
        const rows = rowsRes.rows;

        if (rows.length > 0) {
          const columns = Object.keys(rows[0]);
          const quotedColumns = columns.map((c) => `"${c}"`).join(', ');

          // Escribir en lotes de 100 inserts
          const batchSize = 100;
          for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            const valuesSql = batch
              .map((row) => {
                const values = columns.map((col) => {
                  const val = row[col];
                  if (val === null || val === undefined) return 'NULL';
                  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
                  if (typeof val === 'number') return String(val);
                  if (val instanceof Date) return `'${val.toISOString()}'`;
                  if (typeof val === 'object') {
                    const jsonStr = JSON.stringify(val).replace(/'/g, "''");
                    return `'${jsonStr}'`;
                  }
                  // String
                  const escaped = String(val).replace(/'/g, "''");
                  return `'${escaped}'`;
                });
                return `(${values.join(', ')})`;
              })
              .join(',\n  ');

            writeStream.write(`INSERT INTO "${table}" (${quotedColumns}) VALUES\n  ${valuesSql};\n`);
          }
        }
      }

      // 2. Restaurar secuencias (autoincrementables)
      writeStream.write(`\n-- ---------------------------------------------------------------------\n`);
      writeStream.write(`-- Sincronización de Secuencias Autoincrementables\n`);
      writeStream.write(`-- ---------------------------------------------------------------------\n`);

      const seqRes = await client.query(`
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public';
      `);

      for (const seq of seqRes.rows) {
        const seqName = seq.sequence_name;
        try {
          const valRes = await client.query(`SELECT last_value, is_called FROM "${seqName}"`);
          if (valRes.rows.length > 0) {
            const { last_value, is_called } = valRes.rows[0];
            writeStream.write(`SELECT setval('"${seqName}"', ${last_value}, ${is_called ? 'true' : 'false'});\n`);
          }
        } catch {
          // Ignorar secuencias inaccesibles
        }
      }

      // Pie de página SQL
      const footer = `\n-- Restaurar modo de disparadores y claves foráneas
SET session_replication_role = 'DEFAULT';

-- Fin del Respaldo SICIC-INSAI
`;
      writeStream.write(footer);

      await new Promise((resolve, reject) => {
        writeStream.end();
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
    } finally {
      client.release();
      await pool.end();
    }
  }

  async ejecutarDump(connectionUrl, dbName, outputFile) {
    const pgDumpBin = this.getPgDumpBinaryPath();

    return new Promise((resolve, reject) => {
      // pg_dump rechaza el parámetro 'schema' exclusivo de Prisma en la URI de conexión
      let sanitizedUrl = connectionUrl
        .replace(/([?&])schema=[^&]+(&|$)/, '$1')
        .replace(/[?&]$/, '');

      if (!sanitizedUrl.includes('?')) {
        sanitizedUrl = `${sanitizedUrl}?sslmode=prefer`;
      }

      const cmd = `${pgDumpBin} "${sanitizedUrl}" --clean --if-exists --no-owner --no-privileges --inserts -f "${outputFile}"`;

      exec(cmd, { timeout: 120000 }, async (error) => {
        if (!error && fs.existsSync(outputFile) && fs.statSync(outputFile).size > 0) {
          resolve({ method: 'pg_dump' });
        } else {
          // Fallback autónomo con motor nativo de JavaScript con pg
          try {
            await this.generarRespaldoNativoConPg(connectionUrl, dbName, outputFile);
            resolve({ method: 'native_pg' });
          } catch (nativeErr) {
            reject(new Error(`Fallo en el volcado de base de datos: ${nativeErr.message}`));
          }
        }
      });
    });
  }

  async crearRespaldo({ target = 'operativa', req = null, tipo = 'manual' } = {}) {
    this.ensureDirectory();

    const targetsToRun = [];
    if (target === 'all') {
      targetsToRun.push('master');
      targetsToRun.push('operativa');
    } else {
      targetsToRun.push(target);
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

    const createdFiles = [];

    for (const t of targetsToRun) {
      const { url, dbName, label } = this.resolveConnectionUrl(t, req);
      const safeDbName = dbName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `backup_${t}_${safeDbName}_${dateStr}_${tipo}.sql`;
      const fullPath = path.join(BACKUPS_DIR, filename);

      const result = await this.ejecutarDump(url, dbName, fullPath);
      const stat = fs.statSync(fullPath);

      createdFiles.push({
        filename,
        fullPath,
        target: t,
        dbName,
        label,
        sizeBytes: stat.size,
        sizeFormatted: this.formatBytes(stat.size),
        createdAt: stat.birthtime || stat.mtime,
        method: result.method,
        tipo,
      });
    }

    // Aplicar rotación de copias máximas si fue automático
    if (tipo === 'automatico') {
      this.aplicarRotacion();
    }

    return createdFiles;
  }

  aplicarRotacion() {
    try {
      const config = this.getConfiguracion();
      const max = config.maxCopies || 10;
      const files = this.listarRespaldos();

      if (files.length > max) {
        const toDelete = files.slice(max);
        for (const file of toDelete) {
          try {
            const p = path.join(BACKUPS_DIR, file.filename);
            if (fs.existsSync(p)) fs.unlinkSync(p);
          } catch (e) {
            console.error('[BackupService] Error al rotar archivo antiguo:', e.message);
          }
        }
      }
    } catch (err) {
      console.error('[BackupService] Error en rotación de respaldos:', err.message);
    }
  }

  listarRespaldos() {
    this.ensureDirectory();
    try {
      const entries = fs.readdirSync(BACKUPS_DIR);
      const backups = [];

      for (const entry of entries) {
        if (!entry.endsWith('.sql')) continue;

        const fullPath = path.join(BACKUPS_DIR, entry);
        const stat = fs.statSync(fullPath);

        // Parsear nombre: backup_[target]_[dbName]_[YYYY-MM-DD]_[HH-mm-ss]_[tipo].sql
        let target = 'desconocido';
        let tipo = 'manual';
        let dbName = 'Base de Datos';

        const parts = entry.replace('.sql', '').split('_');
        if (parts.length >= 6) {
          target = parts[1]; // master | operativa
          tipo = parts[parts.length - 1]; // manual | auto | automatico
          dbName = parts.slice(2, parts.length - 3).join('_') || parts[2];
        } else if (parts.length >= 4) {
          target = parts[1];
          tipo = parts[parts.length - 1];
          dbName = parts.slice(2, parts.length - 2).join('_');
        }

        backups.push({
          filename: entry,
          sizeBytes: stat.size,
          sizeFormatted: this.formatBytes(stat.size),
          createdAt: stat.mtime || stat.birthtime,
          target,
          dbName,
          tipo: tipo.includes('auto') ? 'automatico' : 'manual',
        });
      }

      // Ordenar: más recientes primero
      return backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.error('[BackupService] Error al listar respaldos:', err.message);
      return [];
    }
  }

  obtenerEstadisticas() {
    const list = this.listarRespaldos();
    const config = this.getConfiguracion();

    const totalBytes = list.reduce((acc, b) => acc + (b.sizeBytes || 0), 0);
    const lastBackup = list.length > 0 ? list[0] : null;

    return {
      totalRespaldos: list.length,
      espacioOcupadoBytes: totalBytes,
      espacioOcupadoFormatted: this.formatBytes(totalBytes),
      ultimoRespaldo: lastBackup
        ? {
            filename: lastBackup.filename,
            fecha: lastBackup.createdAt,
            tipo: lastBackup.tipo,
            target: lastBackup.target,
            sizeFormatted: lastBackup.sizeFormatted,
          }
        : null,
      autoEnabled: config.enabled,
      autoFrequency: config.frequency,
      autoTime: config.time,
      autoMaxCopies: config.maxCopies,
      lastRun: config.lastRun,
    };
  }

  getFilePath(filename) {
    this.ensureDirectory();
    // Prevenir path traversal
    const safeName = path.basename(filename);
    const fullPath = path.join(BACKUPS_DIR, safeName);
    if (!fs.existsSync(fullPath)) {
      throw new Error('El archivo de respaldo no existe o fue eliminado.');
    }
    return fullPath;
  }

  eliminarRespaldo(filename) {
    const fullPath = this.getFilePath(filename);
    fs.unlinkSync(fullPath);
    return { success: true, message: `Respaldo ${filename} eliminado correctamente.` };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  iniciarScheduler() {
    if (this.schedulerInterval) return;

    // Chequeo liviano cada 60 segundos
    this.schedulerInterval = setInterval(async () => {
      try {
        const config = this.getConfiguracion();
        if (!config.enabled) return;

        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;

        if (currentTime !== config.time) return;

        // Comprobar si ya se ejecutó hoy
        const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
        if (config.lastRunDate === todayStr) return;

        // Verificar frecuencia
        if (config.frequency === 'weekly' && now.getDay() !== (config.dayOfWeek || 1)) {
          return;
        }
        if (config.frequency === 'monthly' && now.getDate() !== (config.dayOfMonth || 1)) {
          return;
        }

        console.log(`[BackupScheduler] Ejecutando respaldo automático programado (${currentTime})...`);

        const targets = config.targets || ['master', 'operativa'];
        for (const target of targets) {
          await this.crearRespaldo({ target, tipo: 'automatico' });
        }

        config.lastRun = new Date().toISOString();
        config.lastRunDate = todayStr;
        config.lastStatus = 'EXITOSO';
        this.guardarConfiguracion(config);

        console.log('[BackupScheduler] Respaldo automático completado con éxito.');
      } catch (err) {
        console.error('[BackupScheduler] Error en ejecución de respaldo automático:', err.message);
        try {
          const config = this.getConfiguracion();
          config.lastStatus = `ERROR: ${err.message}`;
          this.guardarConfiguracion(config);
        } catch {}
      }
    }, 60000);

    // No bloquear el cierre del proceso
    if (this.schedulerInterval.unref) {
      this.schedulerInterval.unref();
    }
  }
}

export default new BackupService();


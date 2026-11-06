export interface RespaldoItem {
  filename: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
  target: 'master' | 'operativa' | string;
  dbName: string;
  tipo: 'manual' | 'automatico';
}

export interface BackupStats {
  totalRespaldos: number;
  espacioOcupadoBytes: number;
  espacioOcupadoFormatted: string;
  ultimoRespaldo: {
    filename: string;
    fecha: string;
    tipo: 'manual' | 'automatico';
    target: string;
    sizeFormatted: string;
  } | null;
  autoEnabled: boolean;
  autoFrequency: 'daily' | 'weekly' | 'monthly';
  autoTime: string;
  autoMaxCopies: number;
  lastRun: string | null;
}

export interface BackupConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  targets: string[];
  maxCopies: number;
  lastRun?: string | null;
  lastStatus?: string | null;
}

export interface BackupResponse {
  status: string;
  message?: string;
  data: {
    respaldos: RespaldoItem[];
    stats: BackupStats;
  };
}

export interface BackupConfigResponse {
  status: string;
  message?: string;
  data: BackupConfig;
}


import type { UbicacionBase } from '@/services/ubicacion.service';

const ESTADO_ABREV_POR_NOMBRE: Record<string, string> = {
  amazonas: 'AMA',
  anzoategui: 'ANZ',
  apure: 'APU',
  aragua: 'ARA',
  barinas: 'BAR',
  bolivar: 'BOL',
  carabobo: 'VAL',
  cojedes: 'COJ',
  'delta amacuro': 'DAM',
  'distrito capital': 'DCT',
  falcon: 'FAL',
  guarico: 'GUA',
  lara: 'LAR',
  merida: 'MER',
  miranda: 'MIR',
  monagas: 'MON',
  'nueva esparta': 'NES',
  portuguesa: 'POR',
  sucre: 'SUC',
  tachira: 'TAC',
  trujillo: 'TRU',
  vargas: 'VAR',
  yaracuy: 'YAR',
  zulia: 'ZUL',
};

export const ESTADO_ABREV_FALLBACK = Object.values(ESTADO_ABREV_POR_NOMBRE).sort();

function normalizarNombreEstado(nombre: string): string {
  return String(nombre || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function resolverAbrevEstado(estado: Pick<UbicacionBase, 'nombre' | 'codigo'>): string | null {
  const desdeNombre = ESTADO_ABREV_POR_NOMBRE[normalizarNombreEstado(estado.nombre)];
  if (desdeNombre) return desdeNombre;

  const codigo = String(estado.codigo || '').trim().toUpperCase();
  if (/^[A-Z]{2,4}$/.test(codigo)) return codigo;

  return null;
}

export function buildEstadoSelectOptions(estados: UbicacionBase[]) {
  return estados
    .map((estado) => {
      const abrev = resolverAbrevEstado(estado);
      if (!abrev) return null;
      return { value: abrev, label: `${abrev} — ${estado.nombre}` };
    })
    .filter((opt): opt is { value: string; label: string } => opt !== null)
    .sort((a, b) => a.label.localeCompare(b.label, 'es'));
}

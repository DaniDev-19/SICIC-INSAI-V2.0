
export function formatHoraInspeccion(value: string | Date | null | undefined): string {
  if (value == null || value === '') return '';
  const d = value instanceof Date ? value : new Date(value);
  if (!Number.isNaN(d.getTime())) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  const raw = String(value);
  const hm = raw.match(/^(\d{1,2}):(\d{2})/);
  if (hm) return `${hm[1].padStart(2, '0')}:${hm[2]}`;
  return '';
}


export function toHoraInputValue(value: string | null | undefined): string {
  return formatHoraInspeccion(value) || '';
}

export function formatHoraInspeccion12h(value: string | null | undefined): string {
  const hhmm = formatHoraInspeccion(value);
  if (!hhmm) return '—';
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'p. m.' : 'a. m.';
  const display = h % 12 || 12;
  return `${display}:${String(m).padStart(2, '0')} ${ampm}`;
}

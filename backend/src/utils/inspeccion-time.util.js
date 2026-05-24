/**
 * Hora de inspección (@db.Time): reloj de pared (la que el usuario escribe en el formulario).
 * Se persiste como Date epoch; al leer se usa hora LOCAL (igual que la tabla en el frontend).
 */

export function parseHoraInspeccion(horaStr) {
  if (!horaStr) return null;
  const m = String(horaStr).trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const hh = m[1].padStart(2, '0');
  const mm = m[2].padStart(2, '0');
  return new Date(`1970-01-01T${hh}:${mm}:00`);
}

export function formatHoraInspeccion(dateInput) {
  if (!dateInput) return '';
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (!Number.isNaN(d.getTime())) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  const raw = String(dateInput);
  const hm = raw.match(/^(\d{1,2}):(\d{2})/);
  if (hm) return `${hm[1].padStart(2, '0')}:${hm[2]}`;
  return '';
}

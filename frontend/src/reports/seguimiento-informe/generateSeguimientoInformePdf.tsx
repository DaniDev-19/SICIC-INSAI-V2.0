import { pdf } from '@react-pdf/renderer';
import { SeguimientoInformeDocument } from './SeguimientoInformeDocument';
import type { SeguimientoReporteDto } from './types';

export async function generateSeguimientoInformePdfBlob(
  data: SeguimientoReporteDto
): Promise<Blob> {
  const logoUrl = `${window.location.origin}/image-insai.png`;
  return pdf(<SeguimientoInformeDocument data={data} logoUrl={logoUrl} />).toBlob();
}

export async function openSeguimientoInformePdf(
  data: SeguimientoReporteDto
): Promise<void> {
  const blob = await generateSeguimientoInformePdfBlob(data);
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => window.URL.revokeObjectURL(url), 120_000);
}

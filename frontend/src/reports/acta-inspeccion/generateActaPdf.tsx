import { pdf } from '@react-pdf/renderer';
import { ActaInspeccionDocument } from './ActaInspeccionDocument';
import type { InspeccionReporteDto } from './types';

export async function generateActaPdfBlob(data: InspeccionReporteDto): Promise<Blob> {
  const logoUrl = `${window.location.origin}/image-insai.png`;
  return pdf(<ActaInspeccionDocument data={data} logoUrl={logoUrl} />).toBlob();
}

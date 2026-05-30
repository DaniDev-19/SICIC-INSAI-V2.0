import { pdf } from '@react-pdf/renderer';
import { ActaSiloDocument } from './ActaSiloDocument';
import type { ActaSiloReporteDto } from './types';

export async function generateActaSiloPdfBlob(data: ActaSiloReporteDto): Promise<Blob> {
  const logoUrl = `${window.location.origin}/image-insai.png`;
  return pdf(<ActaSiloDocument data={data} logoUrl={logoUrl} />).toBlob();
}

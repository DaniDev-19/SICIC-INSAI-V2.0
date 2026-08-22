import { pdf } from '@react-pdf/renderer';
import { AvalSanitarioDocument } from './AvalSanitarioDocument';
import type { AvalSanitarioReporteDto } from './types';

export async function generateAvalSanitarioPdfBlob(
  data: AvalSanitarioReporteDto
): Promise<Blob> {
  const cintilloUrl = `${window.location.origin}/cintillo nuevo.png`;
  const logoVictoriosoUrl = `${window.location.origin}/image-insai.png`;

  return pdf(
    <AvalSanitarioDocument
      data={data}
      cintilloUrl={cintilloUrl}
      logoVictoriosoUrl={logoVictoriosoUrl}
    />
  ).toBlob();
}

export async function openAvalSanitarioPdf(
  data: AvalSanitarioReporteDto
): Promise<void> {
  const blob = await generateAvalSanitarioPdfBlob(data);
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => window.URL.revokeObjectURL(url), 120_000);
}

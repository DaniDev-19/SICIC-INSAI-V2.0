import { pdf } from '@react-pdf/renderer';
import { PropiedadFichaDocument, type PropiedadFichaData } from './PropiedadFichaDocument';

export async function generatePropiedadFichaPdfBlob(
  propiedad: PropiedadFichaData,
  logoUrl: string = '/image-insai.png'
): Promise<Blob> {
  const generadoEl = new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return await pdf(
    <PropiedadFichaDocument
      propiedad={propiedad}
      logoUrl={logoUrl}
      generadoEl={generadoEl}
    />
  ).toBlob();
}

export async function openPropiedadFichaPdf(
  propiedad: PropiedadFichaData,
  logoUrl: string = '/image-insai.png'
): Promise<void> {
  const blob = await generatePropiedadFichaPdfBlob(propiedad, logoUrl);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

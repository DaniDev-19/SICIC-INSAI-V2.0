import { pdf } from '@react-pdf/renderer';
import { ProductorFichaDocument, type ProductorFichaData } from './ProductorFichaDocument';

export async function generateProductorFichaPdfBlob(
  productor: ProductorFichaData,
  logoUrl: string = '/image-insai.png'
): Promise<Blob> {
  const generadoEl = new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return await pdf(
    <ProductorFichaDocument
      productor={productor}
      logoUrl={logoUrl}
      generadoEl={generadoEl}
    />
  ).toBlob();
}

export async function openProductorFichaPdf(
  productor: ProductorFichaData,
  logoUrl: string = '/image-insai.png'
): Promise<void> {
  const blob = await generateProductorFichaPdfBlob(productor, logoUrl);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

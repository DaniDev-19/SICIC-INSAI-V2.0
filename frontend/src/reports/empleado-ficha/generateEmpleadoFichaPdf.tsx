import { pdf } from '@react-pdf/renderer';
import { EmpleadoFichaDocument, type EmpleadoFichaData } from './EmpleadoFichaDocument';

export async function generateEmpleadoFichaPdfBlob(empleado: EmpleadoFichaData): Promise<Blob> {
  const logoUrl = `${window.location.origin}/image-insai.png`;
  const generadoEl = new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return pdf(
    <EmpleadoFichaDocument
      empleado={empleado}
      logoUrl={logoUrl}
      generadoEl={generadoEl}
    />
  ).toBlob();
}

export async function openEmpleadoFichaPdf(empleado: EmpleadoFichaData): Promise<void> {
  const blob = await generateEmpleadoFichaPdfBlob(empleado);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

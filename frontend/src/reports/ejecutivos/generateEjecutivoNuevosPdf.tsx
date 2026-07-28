import { pdf } from '@react-pdf/renderer';
import {
  CaracStatalPdfDocument,
  RankingClientesPdfDocument,
  InspeccionesEmpleadoPdfDocument,
  AvalesSanitariosPdfDocument,
  InspeccionesSilosPdfDocument,
  EmpleadosProgramasPdfDocument,
} from './EjecutivoNuevosDocument';

export async function openCaracStatalPdf(
  records: any[],
  logoUrl: string = '/image-insai.png'
): Promise<void> {
  const generadoEl = new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const blob = await pdf(
    <CaracStatalPdfDocument
      records={records}
      logoUrl={logoUrl}
      generadoEl={generadoEl}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

export async function openRankingClientesPdf(
  ranking: any[],
  logoUrl: string = '/image-insai.png'
): Promise<void> {
  const generadoEl = new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const blob = await pdf(
    <RankingClientesPdfDocument
      ranking={ranking}
      logoUrl={logoUrl}
      generadoEl={generadoEl}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

export async function openInspeccionesEmpleadoPdf(
  inspecciones: any[],
  inspectorInfo?: { nombre: string; apellido: string; cedula: string } | null,
  logoUrl: string = '/image-insai.png'
): Promise<void> {
  const generadoEl = new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const blob = await pdf(
    <InspeccionesEmpleadoPdfDocument
      inspecciones={inspecciones}
      inspectorInfo={inspectorInfo}
      logoUrl={logoUrl}
      generadoEl={generadoEl}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

export async function openAvalesSanitariosPdf(
  avales: any[],
  logoUrl: string = '/image-insai.png'
): Promise<void> {
  const generadoEl = new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const blob = await pdf(
    <AvalesSanitariosPdfDocument
      avales={avales}
      logoUrl={logoUrl}
      generadoEl={generadoEl}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

export async function openInspeccionesSilosPdf(
  silos: any[],
  logoUrl: string = '/image-insai.png'
): Promise<void> {
  const generadoEl = new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const blob = await pdf(
    <InspeccionesSilosPdfDocument
      silos={silos}
      logoUrl={logoUrl}
      generadoEl={generadoEl}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

export async function openEmpleadosProgramasPdf(
  empleadosProgramas: any[],
  logoUrl: string = '/image-insai.png'
): Promise<void> {
  const generadoEl = new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const blob = await pdf(
    <EmpleadosProgramasPdfDocument
      empleadosProgramas={empleadosProgramas}
      logoUrl={logoUrl}
      generadoEl={generadoEl}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

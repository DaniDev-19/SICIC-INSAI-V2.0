export function getApiBaseUrl(): string {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return '';
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/api\/?$/, '');
  }
  return '';
}

export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  let trimmed = String(url).trim();
  if (!trimmed) return '';

  const apiBase = getApiBaseUrl();

  // Si la URL contiene /uploads/, asegurar que siempre apunte al backend / túnel actual
  if (trimmed.includes('/uploads/')) {
    const uploadRelative = trimmed.slice(trimmed.indexOf('/uploads/'));
    return apiBase ? `${apiBase}${uploadRelative}` : uploadRelative;
  }

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) return `${apiBase}${trimmed}`;
  return `${apiBase}/${trimmed}`;
}

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

  if (trimmed.includes('localhost:4000') || trimmed.includes('127.0.0.1:4000')) {
    trimmed = trimmed.replace(/^https?:\/\/(localhost|127\.0\.0\.1):4000/, apiBase);
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) return `${apiBase}${trimmed}`;
  return `${apiBase}/${trimmed}`;
}

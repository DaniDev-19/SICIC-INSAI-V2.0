export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/api\/?$/, '');
  }
  if (
    typeof window !== 'undefined' &&
    window.location.hostname &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return `http://${window.location.hostname}:4000`;
  }
  return (envUrl || 'http://localhost:4000/api').replace(/\/api\/?$/, '');
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

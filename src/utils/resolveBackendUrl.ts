/**
 * Resolve a relative/relative URL to the backend public URL.
 * 
 * Backend returns relative paths like `/leave/...` for uploaded files.
 * These need to be prefixed with the backend's public URL so the
 * browser fetches them from the correct server.
 */
export function resolveBackendUrl(path: string): string {
  // Already absolute URL (http/https/ftp/data URI)
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) {
    return path;
  }

  // Relative path — prepend backend public URL
  const baseUrl = import.meta.env.VITE_API_PUBLIC_URL || 'https://worksy-production.up.railway.app';
  // Remove trailing slash from baseUrl, ensure path has leading slash
  return `${baseUrl.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

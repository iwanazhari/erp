/**
 * Resolve a relative/relative URL to the backend public URL.
 * 
 * Backend returns relative paths like `/leave/...` for uploaded files.
 * These need to be prefixed with the backend's public URL so the
 * browser fetches them from the correct server.
 *
 * Also rewrites absolute MinIO URLs (http://72.61.142.167/minio-files/...)
 * to relative paths so they go through the nginx proxy (avoids mixed-content).
 */
export function resolveBackendUrl(path: string): string {
  if (!path) return path;

  // Rewrite absolute MinIO URLs to relative (fix mixed-content on HTTPS)
  const minioMatch = path.match(/^https?:\/\/[^/]+\/minio-files\/(.*)/);
  if (minioMatch) {
    return `/minio-files/${minioMatch[1]}`;
  }

  // Already absolute URL (http/https/ftp/data URI) — leave as-is
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) {
    return path;
  }

  // Relative path — prepend backend public URL
  const baseUrl = import.meta.env.VITE_API_PUBLIC_URL || '';
  // Remove trailing slash from baseUrl, ensure path has leading slash
  return `${baseUrl.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

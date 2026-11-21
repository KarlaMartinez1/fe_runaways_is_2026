const API_PREFIX = "api/v1";

// Recibe la ruta con o sin prefijo (ej. "auth/login", "api/v1/auth/me", "/api/v1/properties"),
// y devuelve la URL completa: http://localhost:8080/api/v1/auth/login
export function buildApiUrl(path: string): URL {
  if (/^https?:\/\//i.test(path)) {
    return new URL(path);
  }
  const origin = process.env.API_URL;
  if (!origin) {
    throw new Error("Falta la variable de entorno API_URL.");
  }
  const normalizedOrigin = origin.replace(/\/+$/, "").replace(/\/api\/v1$/, "");
  const cleanPath = path.replace(/^\/+/, "").replace(/^api\/v1\/?/, "");
  const relativePath = cleanPath ? `${API_PREFIX}/${cleanPath}` : `${API_PREFIX}/`;
  return new URL(relativePath, `${normalizedOrigin}/`);
}
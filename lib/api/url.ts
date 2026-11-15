const API_PREFIX = "api/v1/";

// Recibe la ruta sin prefijo, por ejemplo "auth/login",
// y devuelve la URL completa: http://localhost:3000/api/v1/auth/login
export function buildApiUrl(path: string): URL {
  const origin = process.env.API_URL;
  if (!origin) {
    throw new Error("Falta la variable de entorno API_URL.");
  }
  const base = `${origin.replace(/\/+$/, "")}/${API_PREFIX}`;
  return new URL(path.replace(/^\/+/, ""), base);
}
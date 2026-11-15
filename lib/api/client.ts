import { cookies } from "next/headers";
import { buildApiUrl } from "@/lib/api/url";
import { SESSION_COOKIE } from "@/lib/session";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code?: string,
    message?: string,
  ) {
    super(message ?? `La API respondió ${status}`);
    this.name = "ApiError";
  }
}

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type RequestOptions = {
  method?: Method;
  body?: unknown;
  accessToken?: string;
};

// Llamada genérica. No lee cookies: el token entra como parámetro, así login
// y registro (que no tienen sesión) pueden usar la misma función.
export async function apiRequest<T = void>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`;

  let response: Response;
  try {
    response = await fetch(buildApiUrl(path), {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "No se pudo conectar con el servidor.");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    throw new ApiError(response.status, body.code, typeof message === "string" ? message : undefined);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

// Igual que apiRequest, pero toma el access token de la cookie del servidor.
// Solo funciona en Server Components, route handlers y acciones.
export async function apiWithSession<T = void>(
  path: string,
  options: Omit<RequestOptions, "accessToken"> = {},
): Promise<T> {
  const store = await cookies();
  const accessToken = store.get(SESSION_COOKIE)?.value;
  return apiRequest<T>(path, { ...options, accessToken });
}

// Helpers que usan los repositorios HTTP de las historias.
// Las firmas coinciden con las de develop: los repositorios no cambian.
export function apiGet<T>(path: string): Promise<T> {
  return apiWithSession<T>(path, { method: "GET" });
}

export function apiPost<T, TBody = unknown>(path: string, body: TBody): Promise<T> {
  return apiWithSession<T>(path, { method: "POST", body });
}

export function apiPatch<T, TBody>(path: string, body: TBody): Promise<T> {
  return apiWithSession<T>(path, { method: "PATCH", body });
}

export function apiDelete(path: string): Promise<void> {
  return apiWithSession<void>(path, { method: "DELETE" });
}
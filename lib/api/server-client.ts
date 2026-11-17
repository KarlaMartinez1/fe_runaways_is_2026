// Servidor únicamente: lee cookies y nunca expone tokens al navegador.
import { cookies } from "next/headers";
import { parseSession, SESSION_COOKIE } from "@/lib/session";
import { buildApiUrl } from "@/lib/api/url";
export { buildApiUrl } from "@/lib/api/url";

export class ApiError extends Error {
  constructor(public status: number, public code?: string, message?: string) {
    super(message ?? `La API respondió ${status}`);
    this.name = "ApiError";
  }
}

async function parseError(response: Response): Promise<ApiError> {
  const body = await response.json().catch(() => ({}));
  const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
  return new ApiError(response.status, body.code, typeof message === "string" ? message : undefined);
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const cookieStore = await cookies();
  const accessToken = parseSession(cookieStore.get(SESSION_COOKIE)?.value)?.accessToken;
  const send = (token?: string) => {
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(buildApiUrl(path), { ...init, headers, cache: "no-store" });
  };
  return send(accessToken);
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await apiFetch(path, init);
  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

import { getSession } from "@/lib/session";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code?: string,
    message?: string,
  ) {
    super(message ?? `La API respondió ${status}`);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("Falta la variable de entorno API_URL.");
  }

  const token = await getSession();
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(new URL(path, apiUrl.replace(/\/?$/, "/")), {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    throw new ApiError(res.status, body.code, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function apiPatch<T, TBody>(path: string, body: TBody): Promise<T> {
  return request<T>(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

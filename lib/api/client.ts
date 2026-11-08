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

function resolveApiUrl(path: string): URL {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("Falta la variable de entorno API_URL.");
  }
  return new URL(path, apiUrl.replace(/\/?$/, "/"));
}

export async function apiGet<T>(path: string): Promise<T> {
  const token = await getSession();
  const res = await fetch(resolveApiUrl(path), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.code, body.message);
  }

  return res.json() as Promise<T>;
}

export async function apiPatch<T, B = unknown>(path: string, body: B): Promise<T> {
  const token = await getSession();
  const res = await fetch(resolveApiUrl(path), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const responseBody = await res.json().catch(() => ({}));
    throw new ApiError(res.status, responseBody.code, responseBody.message);
  }

  return res.json() as Promise<T>;
}

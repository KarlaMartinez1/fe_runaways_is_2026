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

export async function apiGet<T>(path: string): Promise<T> {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("Falta la variable de entorno API_URL.");
  }

  const token = await getSession();
  const res = await fetch(new URL(path, apiUrl.replace(/\/?$/, "/")), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.code, body.message);
  }

  return res.json() as Promise<T>;
}
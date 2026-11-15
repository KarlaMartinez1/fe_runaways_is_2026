import { buildApiUrl } from "@/lib/api/url";
import { refresh as refreshRequest } from "@/lib/api/auth";

export type RotatedTokens = { accessToken: string; refreshToken: string; expiresIn: number };
const inFlight = new Map<string, Promise<RotatedTokens | null>>();

export function rotateRefreshToken(refreshToken: string): Promise<RotatedTokens | null> {
  const existing = inFlight.get(refreshToken);
  if (existing) return existing;
  const pending = (async () => {
    try {
      if (process.env.USE_MOCKS === "true") return await refreshRequest(refreshToken);
      const response = await fetch(buildApiUrl("auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.accessToken && data.refreshToken && Number.isFinite(data.expiresIn)
        ? data as RotatedTokens
        : null;
    } catch {
      return null;
    }
  })();
  inFlight.set(refreshToken, pending);
  return pending.finally(() => inFlight.delete(refreshToken));
}

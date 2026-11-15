import { buildApiUrl } from "@/lib/api/url";

export type RotatedTokens = { accessToken: string; refreshToken: string; expiresIn: number };
const inFlight = new Map<string, Promise<RotatedTokens | null>>();

export function rotateRefreshToken(refreshToken: string): Promise<RotatedTokens | null> {
  const existing = inFlight.get(refreshToken);
  if (existing) return existing;
  // El backend revoca todas las sesiones si se reutiliza un refresh token rotado.
  // Las peticiones simultáneas que comparten el token esperan una única rotación.
  const pending = (async () => {
    try {
      const mockRole = process.env.USE_MOCKS === "true"
        ? refreshToken.match(/^mock-refresh-(TENANT|OWNER|ADMIN)$/)?.[1]
        : undefined;
      const response = mockRole
        ? new Response(JSON.stringify({ accessToken: `mock-access-${mockRole}`, refreshToken, expiresIn: 900 }), { status: 200 })
        : await fetch(buildApiUrl("api/v1/auth/refresh"), {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }), cache: "no-store",
          });
      if (!response.ok) return null;
      const data = await response.json();
      return data.accessToken && data.refreshToken && Number.isFinite(data.expiresIn) ? data as RotatedTokens : null;
    } catch { return null; }
  })();
  inFlight.set(refreshToken, pending);
  return pending.finally(() => inFlight.delete(refreshToken));
}

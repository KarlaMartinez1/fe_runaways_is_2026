import { cookies } from "next/headers";

export const SESSION_COOKIE = "session";
const REFRESH_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  role?: "TENANT" | "OWNER" | "ADMIN";
};

export function parseSession(value?: string): SessionTokens | null {
  if (!value) return null;
  try {
    const session = JSON.parse(value) as Partial<SessionTokens>;
    if (
      typeof session.accessToken === "string" &&
      typeof session.refreshToken === "string" &&
      typeof session.expiresIn === "number" &&
      (session.role === undefined || session.role === "TENANT" || session.role === "OWNER" || session.role === "ADMIN")
    ) return session as SessionTokens;
  } catch {
    // Ignore malformed or legacy cookie values.
  }
  return null;
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: REFRESH_MAX_AGE_SECONDS,
  };
}

export async function createSession(
  accessToken: string,
  expiresInSeconds: number,
  refreshToken: string,
  role?: SessionTokens["role"],
) {
  const store = await cookies();
  const session: SessionTokens = { accessToken, refreshToken, expiresIn: expiresInSeconds, role };
  store.set(SESSION_COOKIE, JSON.stringify(session), cookieOptions());
}

export async function getAccessToken() {
  const store = await cookies();
  return parseSession(store.get(SESSION_COOKIE)?.value)?.accessToken;
}

export async function getRefreshToken() {
  const store = await cookies();
  return parseSession(store.get(SESSION_COOKIE)?.value)?.refreshToken;
}

export async function getSessionRole() {
  const store = await cookies();
  return parseSession(store.get(SESSION_COOKIE)?.value)?.role;
}

export async function deleteSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** @deprecated Solo para compatibilidad con develop. En código nuevo usar getAccessToken. */
export const getSession = getAccessToken;

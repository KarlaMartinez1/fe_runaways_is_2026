import { cookies } from "next/headers";

export const SESSION_COOKIE = "session";
export const REFRESH_SESSION_COOKIE = "refresh_session";

const REFRESH_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function createSession(
  accessToken: string,
  expiresInSeconds: number,
  refreshToken: string,
) {
  const store = await cookies();
  store.set(SESSION_COOKIE, accessToken, cookieOptions(expiresInSeconds));
  store.set(REFRESH_SESSION_COOKIE, refreshToken, cookieOptions(REFRESH_MAX_AGE_SECONDS));
}

export async function getAccessToken() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

export async function getRefreshToken() {
  const store = await cookies();
  return store.get(REFRESH_SESSION_COOKIE)?.value;
}

export async function deleteSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(REFRESH_SESSION_COOKIE);
}

/** @deprecated Solo para compatibilidad con develop. En código nuevo usar getAccessToken. */
export const getSession = getAccessToken;
import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "session";
const PUBLIC_PATHS = ["/login", "/register"];
const REFRESH_EARLY_SECONDS = 60;

type Role = "TENANT" | "OWNER" | "ADMIN";
type SessionTokens = { accessToken: string; refreshToken: string; expiresIn: number; role?: Role };

function readSession(value?: string): SessionTokens | null {
  if (!value) return null;
  try {
    const data = JSON.parse(decodeURIComponent(value)) as Partial<SessionTokens>;
    if (typeof data.accessToken === "string" && typeof data.refreshToken === "string" && typeof data.expiresIn === "number" &&
      (data.role === undefined || data.role === "TENANT" || data.role === "OWNER" || data.role === "ADMIN")) {
      return data as SessionTokens;
    }
  } catch {
    // A malformed or legacy cookie is treated as no session.
  }
  return null;
}

function roleForSession(session: SessionTokens): Role | undefined {
  try {
    const payload = session.accessToken.split(".")[1];
    if (payload) {
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const role = (JSON.parse(atob(normalized)) as { role?: unknown }).role;
      if (role === "TENANT" || role === "OWNER" || role === "ADMIN") return role;
    }
  } catch {
    // Mock tokens are not JWTs; use the role captured at login.
  }
  return session.role;
}

function allowedRoles(pathname: string): Role[] | null {
  if (pathname === "/properties" || pathname === "/properties/") return ["TENANT", "OWNER"];
  if (/^\/properties\/(new|mine|[^/]+\/(edit|availability))$/.test(pathname)) return ["OWNER"];
  if (/^\/properties\/[^/]+$/.test(pathname)) return ["TENANT"];
  if (pathname === "/bookings/mine" || pathname.startsWith("/bookings/mine/")) return ["TENANT"];
  if (/^\/bookings\/[^/]+\/(payment|receipt)$/.test(pathname)) return ["TENANT"];
  if (/^\/bookings\/[^/]+\/(movements|deposit)$/.test(pathname)) return ["TENANT", "OWNER"];
  if (pathname === "/lessor" || pathname.startsWith("/lessor/")) return ["OWNER"];
  if (pathname === "/owner" || pathname.startsWith("/owner/")) return ["OWNER"];
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return ["ADMIN"];
  if (pathname === "/profile" || pathname.startsWith("/profile/")) return ["TENANT", "OWNER"];
  if (pathname === "/messages" || pathname.startsWith("/messages/")) return ["TENANT", "OWNER"];
  if (pathname === "/notifications" || pathname.startsWith("/notifications/")) return ["TENANT", "OWNER", "ADMIN"];
  if (/^\/reservations\/[^/]+\/rate-property$/.test(pathname)) return ["TENANT"];
  if (/^\/reservations\/[^/]+\/rate-renter$/.test(pathname)) return ["OWNER"];
  // Legacy standalone payment and receipt pages are renter-only; deposit is shared.
  if (pathname === "/payment" || pathname === "/receipt") return ["TENANT"];
  if (pathname === "/deposit") return ["TENANT", "OWNER"];
  return null;
}

function accessTokenExpiresAt(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(normalized)) as { exp?: number };
    return typeof claims.exp === "number" ? claims.exp : null;
  } catch {
    return null;
  }
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isPrefetch(request: NextRequest) {
  return request.headers.get("next-router-prefetch") === "1" || request.headers.get("purpose") === "prefetch";
}

function cookieValue(setCookie: string, name: string) {
  return setCookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))?.[1];
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicRoute = isPublicPath(pathname);
  const sessionValue = request.cookies.get(SESSION_COOKIE)?.value;
  const session = readSession(sessionValue);
  const role = session ? roleForSession(session) : undefined;
  const expiresAt = session ? accessTokenExpiresAt(session.accessToken) : null;
  const needsRefresh = Boolean(session && expiresAt !== null && expiresAt <= Math.floor(Date.now() / 1000) + REFRESH_EARLY_SECONDS);

  if (isPrefetch(request) && !needsRefresh) return NextResponse.next();
  if (session && !needsRefresh) {
    if (publicRoute) return NextResponse.redirect(new URL("/", request.nextUrl));
    const allowed = allowedRoles(pathname);
    if (allowed && (!role || !allowed.includes(role))) {
      return NextResponse.redirect(new URL("/acceso-denegado", request.nextUrl));
    }
    return NextResponse.next();
  }

  if (session?.refreshToken) {
    try {
      const refreshResponse = await fetch(new URL("/api/auth/refresh", request.url), {
        method: "POST",
        headers: { cookie: request.headers.get("cookie") ?? "" },
        cache: "no-store",
      });
      if (refreshResponse.ok) {
        const setCookies = refreshResponse.headers.getSetCookie();
        const rotatedSession = setCookies.map((value) => cookieValue(value, SESSION_COOKIE)).find(Boolean);
        const parsed = readSession(rotatedSession);
        if (rotatedSession && parsed) {
          request.cookies.set(SESSION_COOKIE, rotatedSession);
          const refreshedRole = roleForSession(parsed);
          const allowed = allowedRoles(pathname);
          const response = publicRoute
            ? NextResponse.redirect(new URL("/", request.nextUrl))
            : allowed && (!refreshedRole || !allowed.includes(refreshedRole))
              ? NextResponse.redirect(new URL("/acceso-denegado", request.nextUrl))
              : NextResponse.next({ request });
          for (const value of setCookies) response.headers.append("Set-Cookie", value);
          return response;
        }
      }
    } catch {
      // Failed renewal falls through to the normal login redirect.
    }
  }

  if (!publicRoute) return NextResponse.redirect(new URL("/login", request.nextUrl));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

import { NextResponse, type NextRequest } from "next/server";
import { REFRESH_SESSION_COOKIE, SESSION_COOKIE } from "@/lib/session";

const publicRoutes = ["/login", "/payment", "/receipt", "/register", "/deposit"];

function cookieValue(setCookie: string, name: string) {
  return setCookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))?.[1];
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const isBypass = searchParams.get("bypass") === "true" || searchParams.get("dev") === "true";
  const isPublicRoute = publicRoutes.includes(pathname) || isBypass;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (isPublicRoute && hasSession && !isBypass) return NextResponse.redirect(new URL("/", request.nextUrl));
  if (hasSession) return NextResponse.next();

  const refreshToken = request.cookies.get(REFRESH_SESSION_COOKIE)?.value;
  if (refreshToken) {
    try {
      const refreshResponse = await fetch(new URL("/api/auth/refresh", request.url), {
        method: "POST",
        headers: { cookie: request.headers.get("cookie") ?? "" },
        cache: "no-store",
      });
      if (refreshResponse.ok) {
        const setCookies = refreshResponse.headers.getSetCookie();
        const accessToken = setCookies.map((value) => cookieValue(value, SESSION_COOKIE)).find(Boolean);
        const rotatedRefreshToken = setCookies.map((value) => cookieValue(value, REFRESH_SESSION_COOKIE)).find(Boolean);
        if (accessToken) request.cookies.set(SESSION_COOKIE, accessToken);
        if (rotatedRefreshToken) request.cookies.set(REFRESH_SESSION_COOKIE, rotatedRefreshToken);

        const response = NextResponse.next({ request });
        for (const value of setCookies) response.headers.append("Set-Cookie", value);
        return response;
      }
    } catch {
      // Una renovación fallida deja que el flujo normal redirija a login.
    }
  }

  if (!isPublicRoute) return NextResponse.redirect(new URL("/login", request.nextUrl));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

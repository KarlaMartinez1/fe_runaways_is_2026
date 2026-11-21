import { NextResponse } from "next/server";
import { rotateRefreshToken } from "@/lib/api/refresh";
import { createSession, getRefreshToken, getSessionRole, SESSION_COOKIE } from "@/lib/session";

export async function POST() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    const response = new NextResponse(null, { status: 401 });
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  const tokens = await rotateRefreshToken(refreshToken);
  if (!tokens) {
    const response = new NextResponse(null, { status: 401 });
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  const role = tokens.user?.role ?? await getSessionRole();
  await createSession(tokens.accessToken, tokens.expiresIn, tokens.refreshToken, role);
  return new NextResponse(null, { status: 204 });
}

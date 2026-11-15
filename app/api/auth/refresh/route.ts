import { NextResponse } from "next/server";
import { rotateRefreshToken } from "@/lib/api/refresh";
import { createSession, getRefreshToken } from "@/lib/session";

export async function POST() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return new NextResponse(null, { status: 401 });

  const tokens = await rotateRefreshToken(refreshToken);
  if (!tokens) return new NextResponse(null, { status: 401 });

  await createSession(tokens.accessToken, tokens.expiresIn, tokens.refreshToken);
  return new NextResponse(null, { status: 204 });
}

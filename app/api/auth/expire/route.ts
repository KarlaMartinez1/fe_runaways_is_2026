import { NextResponse } from "next/server";
import { REFRESH_SESSION_COOKIE, SESSION_COOKIE } from "@/lib/session";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(REFRESH_SESSION_COOKIE);
  return response;
}

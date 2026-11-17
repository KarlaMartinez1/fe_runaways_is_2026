import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { notificationRepository } from "@/lib/repositories";
import { apiRequest, ApiError } from "@/lib/api/client";
import { SESSION_COOKIE } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieStore = await cookies();
    const hasSessionCookie = Boolean(cookieStore.get(SESSION_COOKIE)?.value);

    if (authHeader && !hasSessionCookie && process.env.USE_MOCKS !== "true") {
      const accessToken = authHeader.replace(/^Bearer\s+/i, "");
      const response = await apiRequest<{ unreadCount: number }>(
        "notifications/unread-count",
        { accessToken }
      );
      return NextResponse.json(response);
    }

    const unreadCount = await notificationRepository.getUnreadCount();
    return NextResponse.json({ unreadCount });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { code: error.code ?? "API_ERROR", message: error.message },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "Error al consultar contador de notificaciones no leídas",
      },
      { status: 500 }
    );
  }
}

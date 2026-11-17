import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { notificationRepository } from "@/lib/repositories";
import { apiRequest, ApiError } from "@/lib/api/client";
import { SESSION_COOKIE } from "@/lib/session";

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieStore = await cookies();
    const hasSessionCookie = Boolean(cookieStore.get(SESSION_COOKIE)?.value);

    if (authHeader && !hasSessionCookie && process.env.USE_MOCKS !== "true") {
      const accessToken = authHeader.replace(/^Bearer\s+/i, "");
      const response = await apiRequest<{ updatedCount: number }>(
        "notifications/read-all",
        { method: "PATCH", accessToken, body: {} }
      );
      return NextResponse.json(response);
    }

    await notificationRepository.markAllAsRead();
    return NextResponse.json({ success: true });
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
        message: "Error al marcar todas las notificaciones como leídas",
      },
      { status: 500 }
    );
  }
}

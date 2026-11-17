import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { notificationRepository } from "@/lib/repositories";
import { apiRequest, ApiError } from "@/lib/api/client";
import { SESSION_COOKIE } from "@/lib/session";
import type { NotificationItem } from "@/lib/repositories/notification-repository";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const authHeader = request.headers.get("authorization");
    const cookieStore = await cookies();
    const hasSessionCookie = Boolean(cookieStore.get(SESSION_COOKIE)?.value);

    if (authHeader && !hasSessionCookie && process.env.USE_MOCKS !== "true") {
      const accessToken = authHeader.replace(/^Bearer\s+/i, "");
      const response = await apiRequest<NotificationItem>(
        `notifications/${encodeURIComponent(id)}/read`,
        { method: "PATCH", accessToken, body: {} }
      );
      return NextResponse.json(response);
    }

    const result = await notificationRepository.markAsRead(id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { code: error.code ?? "API_ERROR", message: error.message },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "Error al marcar notificación como leída" },
      { status: 500 }
    );
  }
}

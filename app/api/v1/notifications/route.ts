import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { notificationRepository } from "@/lib/repositories";
import { apiRequest, ApiError } from "@/lib/api/client";
import { SESSION_COOKIE } from "@/lib/session";
import type { NotificationListResult } from "@/lib/repositories/notification-repository";

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return search.toString();
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page")) || 1;
  const limit =
    Number(searchParams.get("limit") || searchParams.get("pageSize")) || 10;

  try {
    const authHeader = request.headers.get("authorization");
    const cookieStore = await cookies();
    const hasSessionCookie = Boolean(cookieStore.get(SESSION_COOKIE)?.value);

    // Si viene encabezado Authorization y no hay cookie de sesión, retransmitir directamente al backend
    if (authHeader && !hasSessionCookie && process.env.USE_MOCKS !== "true") {
      const accessToken = authHeader.replace(/^Bearer\s+/i, "");
      const query = buildQuery({ page, limit });
      const url = query ? `notifications?${query}` : "notifications";
      const response = await apiRequest<NotificationListResult>(url, {
        accessToken,
      });
      return NextResponse.json(response);
    }

    const result = await notificationRepository.list({ page, pageSize: limit });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { code: error.code ?? "API_ERROR", message: error.message },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "Error al obtener notificaciones" },
      { status: 500 }
    );
  }
}

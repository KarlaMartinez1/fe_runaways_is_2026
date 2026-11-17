import { NextResponse, type NextRequest } from "next/server";
import { notificationRepository } from "@/lib/repositories";
import { ApiError } from "@/lib/api/client";

export async function PATCH(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
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

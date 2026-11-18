import { NextResponse } from "next/server";
import { notificationRepository } from "@/lib/repositories";
import { ApiError } from "@/lib/api/client";

export async function PATCH() {
  try {
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

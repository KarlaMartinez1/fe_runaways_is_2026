import { NextResponse } from "next/server";
import { notificationRepository } from "@/lib/repositories";
import { ApiError } from "@/lib/api/client";

export async function GET() {
  try {
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

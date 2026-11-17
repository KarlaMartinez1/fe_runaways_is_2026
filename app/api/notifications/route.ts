import { NextResponse, type NextRequest } from "next/server";
import { notificationRepository } from "@/lib/repositories";
import { ApiError } from "@/lib/api/client";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page")) || 1;
  const limit =
    Number(searchParams.get("limit") || searchParams.get("pageSize")) || 10;

  try {
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

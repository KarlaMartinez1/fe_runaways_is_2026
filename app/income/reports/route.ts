import { NextResponse, type NextRequest } from "next/server";
import { reportRepository } from "@/lib/repositories";
import { ApiError } from "@/lib/api/client";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;

  try {
    const summary = await reportRepository.getIncomeSummary({ from, to });
    return NextResponse.json(summary);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { code: error.code ?? "API_ERROR", message: error.message },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "Error al obtener reporte de ingresos" },
      { status: 500 }
    );
  }
}

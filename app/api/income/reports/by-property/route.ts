import { NextResponse, type NextRequest } from "next/server";
import { reportRepository } from "@/lib/repositories";
import { ApiError } from "@/lib/api/client";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;
  const order = (searchParams.get("order") as "asc" | "desc") || "desc";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;

  try {
    const result = await reportRepository.getIncomeByProperty({
      from,
      to,
      order,
      page,
      pageSize,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { code: error.code ?? "API_ERROR", message: error.message },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "Error al obtener reporte de ingresos por bien" },
      { status: 500 }
    );
  }
}

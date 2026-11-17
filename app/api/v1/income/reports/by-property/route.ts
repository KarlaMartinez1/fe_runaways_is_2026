import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { reportRepository } from "@/lib/repositories";
import { apiRequest, ApiError } from "@/lib/api/client";
import { SESSION_COOKIE } from "@/lib/session";
import type { PropertyIncomeListResult } from "@/lib/repositories/report-repository";

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return search.toString();
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;
  const order = (searchParams.get("order") as "asc" | "desc") || "desc";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;

  try {
    const authHeader = request.headers.get("authorization");
    const cookieStore = await cookies();
    const hasSessionCookie = Boolean(cookieStore.get(SESSION_COOKIE)?.value);

    // Si viene Authorization header y no hay cookie de sesión, reenviar token directo al backend
    if (authHeader && !hasSessionCookie && process.env.USE_MOCKS !== "true") {
      const accessToken = authHeader.replace(/^Bearer\s+/i, "");
      const query = buildQuery({
        from,
        to,
        order,
        page,
        pageSize,
      });
      const response = await apiRequest<PropertyIncomeListResult>(
        `income/reports/by-property?${query}`,
        { accessToken }
      );
      return NextResponse.json(response);
    }

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

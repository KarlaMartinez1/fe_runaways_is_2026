import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { reportRepository } from "@/lib/repositories";
import { apiRequest, ApiError } from "@/lib/api/client";
import { SESSION_COOKIE } from "@/lib/session";
import type { PropertyStatus } from "@/lib/api/types";

const fromApiStatus: Record<string, PropertyStatus> = {
  AVAILABLE: "DISPONIBLE",
  PAUSED: "PAUSADO",
  DELETED: "ELIMINADO",
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return search.toString();
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const order = (searchParams.get("order") as "asc" | "desc") || "desc";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;

  try {
    const authHeader = request.headers.get("authorization");
    const cookieStore = await cookies();
    const hasSessionCookie = Boolean(cookieStore.get(SESSION_COOKIE)?.value);

    // Si viene Authorization header y no hay cookie de sesión, reenviar token directo al backend
    if (authHeader && !hasSessionCookie && process.env.USE_MOCKS !== "true") {
      const accessToken = authHeader.replace(/^Bearer\s+/i, "").trim();
      const query = buildQuery({
        order,
        page,
        pageSize,
      });
      const response = await apiRequest<{
        data?: Array<{
          propertyId: string;
          title: string;
          status?: string;
          averageRating?: number | null;
          reviewCount?: number;
          lastReviewDate?: string | null;
        }>;
        total?: number;
        page?: number;
        pageSize?: number;
        totalPages?: number;
      }>(`owner/reports/ratings?${query}`, { accessToken });

      const total = response.total ?? response.data?.length ?? 0;
      const computedPageSize = response.pageSize ?? pageSize;
      const totalPages =
        response.totalPages ?? Math.max(1, Math.ceil(total / (computedPageSize || 10)));

      const data = (response.data ?? []).map((item) => ({
        propertyId: item.propertyId,
        title: item.title,
        status: (item.status && fromApiStatus[item.status]
          ? fromApiStatus[item.status]
          : (item.status as PropertyStatus)) || "DISPONIBLE",
        averageRating: item.averageRating ?? null,
        reviewCount: item.reviewCount ?? 0,
        lastReviewDate: item.lastReviewDate ?? null,
      }));

      return NextResponse.json({
        data,
        total,
        page: response.page ?? page,
        pageSize: computedPageSize,
        totalPages,
      });
    }

    const result = await reportRepository.getPropertyRatings({
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
      { code: "SERVER_ERROR", message: "Error al obtener reporte de calificaciones de bienes" },
      { status: 500 }
    );
  }
}

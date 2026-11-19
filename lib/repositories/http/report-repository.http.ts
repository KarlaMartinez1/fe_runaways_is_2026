import { apiGet } from "@/lib/api/client";
import type {
  GetIncomeParams,
  GetPropertyIncomeParams,
  GetPropertyOccupancyParams,
  GetPropertyRatingsParams,
  IncomeSummary,
  PropertyIncomeListResult,
  PropertyOccupancyListResult,
  PropertyRatingListResult,
  ReportRepository,
} from "../report-repository";
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

export const httpReportRepository: ReportRepository = {
  getIncomeSummary(params?: GetIncomeParams) {
    const query = buildQuery({
      from: params?.from,
      to: params?.to,
    });
    const url = query ? `income/reports?${query}` : "income/reports";
    return apiGet<IncomeSummary>(url);
  },

  async getIncomeByProperty(params?: GetPropertyIncomeParams): Promise<PropertyIncomeListResult> {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const query = buildQuery({
      from: params?.from,
      to: params?.to,
      order: params?.order ?? "desc",
      page,
      pageSize,
    });
    const result = await apiGet<PropertyIncomeListResult>(`income/reports/by-property?${query}`);
    const total = result.total ?? result.data?.length ?? 0;
    const computedPageSize = result.pageSize ?? pageSize;
    const totalPages =
      result.totalPages ?? Math.max(1, Math.ceil(total / (computedPageSize || 10)));

    return {
      from: result.from ?? params?.from ?? null,
      to: result.to ?? params?.to ?? null,
      data: result.data ?? [],
      rentalIncome: result.rentalIncome ?? "0.00",
      retainedDepositIncome: result.retainedDepositIncome ?? "0.00",
      totalIncome: result.totalIncome ?? "0.00",
      total,
      page: result.page ?? page,
      pageSize: computedPageSize,
      totalPages,
    };
  },

  async getPropertyRatings(params?: GetPropertyRatingsParams): Promise<PropertyRatingListResult> {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const order = params?.order === "asc" ? "asc" : "desc";
    const query = buildQuery({
      order,
      page,
      pageSize,
    });
    const result = await apiGet<{
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
    }>(`owner/reports/ratings?${query}`);

    const total = result.total ?? result.data?.length ?? 0;
    const computedPageSize = result.pageSize ?? pageSize;
    const totalPages =
      result.totalPages ?? Math.max(1, Math.ceil(total / (computedPageSize || 10)));

    const data = (result.data ?? []).map((item) => ({
      propertyId: item.propertyId,
      title: item.title,
      status: (item.status && fromApiStatus[item.status]
        ? fromApiStatus[item.status]
        : (item.status as PropertyStatus)) || "DISPONIBLE",
      averageRating: item.averageRating ?? null,
      reviewCount: item.reviewCount ?? 0,
      lastReviewDate: item.lastReviewDate ?? null,
    }));

    return {
      data,
      total,
      page: result.page ?? page,
      pageSize: computedPageSize,
      totalPages,
    };
  },

  getPropertyOccupancy(params?: GetPropertyOccupancyParams) {
    const query = buildQuery({
      from: params?.from,
      to: params?.to,
      order: params?.order ?? "desc",
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    });
    return apiGet<PropertyOccupancyListResult>(`api/v1/lessor/reports/occupancy?${query}`);
  },
};

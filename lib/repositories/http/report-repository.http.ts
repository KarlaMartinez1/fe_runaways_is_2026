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

  getPropertyRatings(params?: GetPropertyRatingsParams) {
    const query = buildQuery({
      from: params?.from,
      to: params?.to,
      order: params?.order ?? "desc",
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    });
    return apiGet<PropertyRatingListResult>(`api/v1/lessor/reports/ratings?${query}`);
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

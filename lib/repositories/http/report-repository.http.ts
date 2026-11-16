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
    const url = query ? `api/v1/lessor/reports/income?${query}` : "api/v1/lessor/reports/income";
    return apiGet<IncomeSummary>(url);
  },

  getIncomeByProperty(params?: GetPropertyIncomeParams) {
    const query = buildQuery({
      from: params?.from,
      to: params?.to,
      order: params?.order ?? "desc",
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    });
    return apiGet<PropertyIncomeListResult>(`api/v1/lessor/reports/income/by-property?${query}`);
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

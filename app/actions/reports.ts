"use server";

import { reportRepository } from "@/lib/repositories";
import type {
  IncomeSummary,
  PropertyIncomeListResult,
  PropertyRatingListResult,
  PropertyOccupancyListResult,
} from "@/lib/repositories/report-repository";

export interface FetchReportsParams {
  from?: string;
  to?: string;
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export async function fetchReportsDataAction(params: FetchReportsParams): Promise<{
  summary: IncomeSummary;
  propertyIncome: PropertyIncomeListResult;
}> {
  const hasDateFilter = Boolean(params.from || params.to);
  const summaryPromise = hasDateFilter
    ? reportRepository.getIncomeSummary({
        from: params.from,
        to: params.to,
      })
    : Promise.resolve({
        from: null,
        to: null,
        rentalIncome: "0.00",
        retainedDepositIncome: "0.00",
        totalIncome: "0.00",
      });

  const propertyIncomePromise = hasDateFilter
    ? reportRepository.getIncomeByProperty({
        from: params.from,
        to: params.to,
        order: params.order,
        page: params.page,
        pageSize: params.pageSize,
      })
    : Promise.resolve({
        data: [],
        totalIncome: "0.00",
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      });

  const [summary, propertyIncome] = await Promise.all([
    summaryPromise,
    propertyIncomePromise,
  ]);

  return { summary, propertyIncome };
}

export interface FetchRatingsParams {
  from?: string;
  to?: string;
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export async function fetchRatingsDataAction(
  params: FetchRatingsParams
): Promise<PropertyRatingListResult> {
  return reportRepository.getPropertyRatings({
    from: params.from,
    to: params.to,
    order: params.order,
    page: params.page,
    pageSize: params.pageSize,
  });
}

export interface FetchOccupancyParams {
  from?: string;
  to?: string;
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export async function fetchOccupancyDataAction(
  params: FetchOccupancyParams
): Promise<PropertyOccupancyListResult> {
  return reportRepository.getPropertyOccupancy({
    from: params.from,
    to: params.to,
    order: params.order,
    page: params.page,
    pageSize: params.pageSize,
  });
}

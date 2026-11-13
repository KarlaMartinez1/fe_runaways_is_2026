"use server";

import { reportRepository } from "@/lib/repositories";
import type {
  IncomeSummary,
  PropertyIncomeListResult,
  PropertyRatingListResult,
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
  const [summary, propertyIncome] = await Promise.all([
    reportRepository.getIncomeSummary({
      from: params.from,
      to: params.to,
    }),
    reportRepository.getIncomeByProperty({
      from: params.from,
      to: params.to,
      order: params.order,
      page: params.page,
      pageSize: params.pageSize,
    }),
  ]);

  return { summary, propertyIncome };
}

export interface FetchRatingsParams {
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export async function fetchRatingsDataAction(
  params: FetchRatingsParams
): Promise<PropertyRatingListResult> {
  return reportRepository.getPropertyRatings({
    order: params.order,
    page: params.page,
    pageSize: params.pageSize,
  });
}

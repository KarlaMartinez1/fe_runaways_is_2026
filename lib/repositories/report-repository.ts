import type { PropertyStatus } from "@/lib/api/types";

export interface IncomeSummary {
  from: string | null;
  to: string | null;
  rentalIncome: string;
  retainedDepositIncome: string;
  totalIncome: string;
}

export interface PropertyIncomeItem {
  propertyId: string;
  title: string;
  status: PropertyStatus;
  lastIncomeDate: string | null;
  rentalIncome: string;
  retainedDepositIncome: string;
  totalIncome: string;
}

export interface PropertyIncomeListResult {
  data: PropertyIncomeItem[];
  totalIncome: string;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetIncomeParams {
  from?: string;
  to?: string;
}

export interface GetPropertyIncomeParams {
  from?: string;
  to?: string;
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface PropertyRatingItem {
  propertyId: string;
  title: string;
  status: PropertyStatus;
  averageRating: number | null;
  reviewCount: number;
}

export interface PropertyRatingListResult {
  data: PropertyRatingItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetPropertyRatingsParams {
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface PropertyOccupancyItem {
  propertyId: string;
  title: string;
  status: PropertyStatus;
  occupiedDays: number;
  periodDays: number;
  occupancyRate: number;
}

export interface PropertyOccupancyListResult {
  from: string;
  to: string;
  periodDays: number;
  data: PropertyOccupancyItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetPropertyOccupancyParams {
  from?: string;
  to?: string;
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface ReportRepository {
  getIncomeSummary(params?: GetIncomeParams): Promise<IncomeSummary>;
  getIncomeByProperty(params?: GetPropertyIncomeParams): Promise<PropertyIncomeListResult>;
  getPropertyRatings(params?: GetPropertyRatingsParams): Promise<PropertyRatingListResult>;
  getPropertyOccupancy(params?: GetPropertyOccupancyParams): Promise<PropertyOccupancyListResult>;
}

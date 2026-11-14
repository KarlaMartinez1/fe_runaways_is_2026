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
import {
  defaultIncomeSummaryFixture,
  propertyIncomeItemsFixture,
  propertyOccupancyItemsFixture,
  propertyRatingItemsFixture,
} from "./fixtures/reports";

function parseFixtureDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  // Format DD/MM/YYYY or YYYY-MM-DD in local time
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
  }
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
  }
  return new Date(dateStr);
}

function formatDateToDDMMYYYY(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export const mockReportRepository: ReportRepository = {
  async getIncomeSummary(params?: GetIncomeParams): Promise<IncomeSummary> {
    const from = params?.from ?? null;
    const to = params?.to ?? null;

    if (!from && !to) {
      return defaultIncomeSummaryFixture;
    }

    const fromDate = from ? parseFixtureDate(from) : null;
    const toDate = to ? parseFixtureDate(to) : null;
    if (toDate) {
      toDate.setHours(23, 59, 59, 999);
    }

    const filtered = propertyIncomeItemsFixture.filter((item) => {
      const itemDate = parseFixtureDate(item.lastIncomeDate);
      if (!itemDate) return false;
      if (fromDate && itemDate < fromDate) return false;
      if (toDate && itemDate > toDate) return false;
      return true;
    });

    const totalRental = filtered.reduce((acc, curr) => acc + parseFloat(curr.rentalIncome), 0);
    const totalDeposit = filtered.reduce(
      (acc, curr) => acc + parseFloat(curr.retainedDepositIncome),
      0
    );
    const total = totalRental + totalDeposit;

    return {
      from,
      to,
      rentalIncome: totalRental.toFixed(2),
      retainedDepositIncome: totalDeposit.toFixed(2),
      totalIncome: total.toFixed(2),
    };
  },

  async getIncomeByProperty(
    params?: GetPropertyIncomeParams
  ): Promise<PropertyIncomeListResult> {
    const order = params?.order ?? "desc";
    const page = Math.max(1, params?.page ?? 1);
    const pageSize = params?.pageSize ?? 10;
    const from = params?.from ? parseFixtureDate(params.from) : null;
    const to = params?.to ? parseFixtureDate(params.to) : null;
    if (to) {
      to.setHours(23, 59, 59, 999);
    }

    let items = [...propertyIncomeItemsFixture];

    if (from || to) {
      items = items.filter((item) => {
        const itemDate = parseFixtureDate(item.lastIncomeDate);
        if (!itemDate) {
          return parseFloat(item.totalIncome) === 0;
        }
        if (from && itemDate < from) return false;
        if (to && itemDate > to) return false;
        return true;
      });
    }

    items.sort((a, b) => {
      const aVal = parseFloat(a.totalIncome);
      const bVal = parseFloat(b.totalIncome);
      return order === "asc" ? aVal - bVal : bVal - aVal;
    });

    const totalIncome = items
      .reduce((acc, curr) => acc + parseFloat(curr.totalIncome), 0)
      .toFixed(2);

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);

    return {
      data: paginatedItems,
      totalIncome,
      total,
      page,
      pageSize,
      totalPages,
    };
  },

  async getPropertyRatings(
    params?: GetPropertyRatingsParams
  ): Promise<PropertyRatingListResult> {
    const order = params?.order ?? "desc";
    const page = Math.max(1, params?.page ?? 1);
    const pageSize = params?.pageSize ?? 10;

    const from = params?.from ? parseFixtureDate(params.from) : null;
    const to = params?.to ? parseFixtureDate(params.to) : null;
    if (to) {
      to.setHours(23, 59, 59, 999);
    }

    let items = [...propertyRatingItemsFixture];

    if (from || to) {
      items = items.filter((item) => {
        const itemDate = parseFixtureDate(item.lastReviewDate ?? null);
        if (!itemDate) {
          return false;
        }
        if (from && itemDate < from) return false;
        if (to && itemDate > to) return false;
        return true;
      });
    }

    items.sort((a, b) => {
      const aVal = a.averageRating ?? -1;
      const bVal = b.averageRating ?? -1;
      return order === "asc" ? aVal - bVal : bVal - aVal;
    });

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);

    return {
      data: paginatedItems,
      total,
      page,
      pageSize,
      totalPages,
    };
  },

  async getPropertyOccupancy(
    params?: GetPropertyOccupancyParams
  ): Promise<PropertyOccupancyListResult> {
    const order = params?.order ?? "desc";
    const page = Math.max(1, params?.page ?? 1);
    const pageSize = params?.pageSize ?? 10;

    let fromFormatted = "05/10/2026";
    let toFormatted = "03/11/2026";
    let periodDays = 30;

    if (params?.from && params?.to) {
      const fromDate = parseFixtureDate(params.from);
      const toDate = parseFixtureDate(params.to);
      if (fromDate && toDate) {
        const diffMs = toDate.getTime() - fromDate.getTime();
        periodDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
        fromFormatted = formatDateToDDMMYYYY(fromDate);
        toFormatted = formatDateToDDMMYYYY(toDate);
      }
    }

    const items = propertyOccupancyItemsFixture.map((item) => {
      const occupiedDays = Math.min(item.occupiedDays, periodDays);
      const rate = Number(((occupiedDays / periodDays) * 100).toFixed(1));
      return {
        ...item,
        occupiedDays,
        periodDays,
        occupancyRate: rate,
      };
    });

    items.sort((a, b) => {
      return order === "asc"
        ? a.occupancyRate - b.occupancyRate
        : b.occupancyRate - a.occupancyRate;
    });

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);

    return {
      from: fromFormatted,
      to: toFormatted,
      periodDays,
      data: paginatedItems,
      total,
      page,
      pageSize,
      totalPages,
    };
  },
};

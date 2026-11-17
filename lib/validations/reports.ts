import { z } from "zod";
import { reportMessages } from "@/lib/messages/reports";

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const reportDateFilterSchema = z
  .object({
    from: z.string().optional(),
    to: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.from || !data.to) return true;
      return data.to >= data.from;
    },
    {
      message: reportMessages.filter.invalidDateRange,
      path: ["to"],
    }
  );

export type ReportDateFilterFormData = z.infer<typeof reportDateFilterSchema>;

export const ratingsReportFilterSchema = z
  .object({
    from: z.string().optional(),
    to: z.string().optional(),
  })
  .refine(
    (data) => {
      const today = getTodayString();
      if (data.from && data.from > today) return false;
      if (data.to && data.to > today) return false;
      return true;
    },
    {
      message: reportMessages.filter.futureDateNotAllowed,
      path: ["to"],
    }
  )
  .refine(
    (data) => {
      if (!data.from || !data.to) return true;
      return data.to >= data.from;
    },
    {
      message: reportMessages.filter.invalidDateRange,
      path: ["to"],
    }
  );

export type RatingsReportFilterFormData = z.infer<typeof ratingsReportFilterSchema>;

export const occupancyReportFilterSchema = z
  .object({
    from: z.string().optional(),
    to: z.string().optional(),
  })
  .refine(
    (data) => {
      const today = getTodayString();
      if (data.from && data.from > today) return false;
      if (data.to && data.to > today) return false;
      return true;
    },
    {
      message: reportMessages.filter.futureDateNotAllowed,
      path: ["to"],
    }
  )
  .refine(
    (data) => {
      if (!data.from || !data.to) return true;
      return data.to >= data.from;
    },
    {
      message: reportMessages.filter.invalidDateRange,
      path: ["to"],
    }
  )
  .refine(
    (data) => {
      if (!data.from || !data.to) return true;
      const diffMs = new Date(data.to).getTime() - new Date(data.from).getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;
      return diffDays <= 365;
    },
    {
      message: reportMessages.filter.periodExceeded,
      path: ["to"],
    }
  );

export type OccupancyReportFilterFormData = z.infer<typeof occupancyReportFilterSchema>;

import { z } from "zod";
import { reportMessages } from "@/lib/messages/reports";

export const reportDateFilterSchema = z
  .object({
    from: z.string().optional(),
    to: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.from || !data.to) return true;
      return new Date(data.to) >= new Date(data.from);
    },
    {
      message: reportMessages.filter.invalidDateRange,
      path: ["to"],
    }
  );

export type ReportDateFilterFormData = z.infer<typeof reportDateFilterSchema>;

export const occupancyReportFilterSchema = z
  .object({
    from: z.string().optional(),
    to: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.from || !data.to) return true;
      return new Date(data.to) >= new Date(data.from);
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

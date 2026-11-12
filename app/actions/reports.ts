"use server";

import { reportRepository } from "@/lib/repositories";
import type { IncomeSummary } from "@/lib/repositories/report-repository";

export interface FetchReportsParams {
  from?: string;
  to?: string;
}

export async function fetchReportsDataAction(params: FetchReportsParams): Promise<{
  summary: IncomeSummary;
}> {
  const summary = await reportRepository.getIncomeSummary({
    from: params.from,
    to: params.to,
  });

  return { summary };
}

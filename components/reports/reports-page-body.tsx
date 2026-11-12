'use client';

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { reportMessages } from "@/lib/messages/reports";
import { fetchReportsDataAction } from "@/app/actions/reports";
import type { IncomeSummary } from "@/lib/repositories/report-repository";
import { ReportsNav } from "./reports-nav";
import { ReportsDateFilter } from "./reports-date-filter";
import { IncomeSummaryCard } from "./income-summary-card";

export interface ReportsPageBodyProps {
  initialSummary: IncomeSummary;
  initialFrom?: string;
  initialTo?: string;
  className?: string;
}

export function ReportsPageBody({
  initialSummary,
  initialFrom = "",
  initialTo = "",
  className,
}: ReportsPageBodyProps) {
  const router = useRouter();

  const [from, setFrom] = React.useState<string>(initialFrom);
  const [to, setTo] = React.useState<string>(initialTo);
  const [summary, setSummary] = React.useState<IncomeSummary>(initialSummary);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const syncUrl = React.useCallback(
    (newFrom: string, newTo: string) => {
      const params = new URLSearchParams();
      if (newFrom) params.set("from", newFrom);
      if (newTo) params.set("to", newTo);

      const query = params.toString();
      const newUrl = query ? `/lessor/reports?${query}` : "/lessor/reports";
      router.replace(newUrl);
    },
    [router]
  );

  const fetchData = React.useCallback(
    async (newFrom: string, newTo: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchReportsDataAction({
          from: newFrom || undefined,
          to: newTo || undefined,
        });

        setSummary(result.summary);
        syncUrl(newFrom, newTo);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError(reportMessages.errors.loadError);
      } finally {
        setIsLoading(false);
      }
    },
    [syncUrl]
  );

  const handleApplyFilter = (values: { from?: string; to?: string }) => {
    const nextFrom = values.from ?? "";
    const nextTo = values.to ?? "";
    setFrom(nextFrom);
    setTo(nextTo);
    fetchData(nextFrom, nextTo);
  };

  const handleClearFilter = () => {
    setFrom("");
    setTo("");
    fetchData("", "");
  };

  const handleRetry = () => {
    fetchData(from, to);
  };

  return (
    <main
      className={cn(
        "mx-auto w-full max-w-[1200px] flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-8",
        className
      )}
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          {reportMessages.pageTitle}
        </h1>
      </div>

      <ReportsDateFilter
        initialFrom={from}
        initialTo={to}
        onApply={handleApplyFilter}
        onClear={handleClearFilter}
        isLoading={isLoading}
      />

      <IncomeSummaryCard
        rentalIncome={summary.rentalIncome}
        retainedDepositIncome={summary.retainedDepositIncome}
        totalIncome={summary.totalIncome}
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
      />

      <ReportsNav />
    </main>
  );
}

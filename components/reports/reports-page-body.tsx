'use client';

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { reportMessages } from "@/lib/messages/reports";
import { fetchReportsDataAction } from "@/app/actions/reports";
import type {
  IncomeSummary,
  PropertyIncomeListResult,
} from "@/lib/repositories/report-repository";
import { ReportsNav } from "./reports-nav";
import { ReportsDateFilter } from "./reports-date-filter";
import { IncomeSummaryCard } from "./income-summary-card";
import { PropertyIncomeTable } from "./property-income-table";

export interface ReportsPageBodyProps {
  initialSummary: IncomeSummary;
  initialPropertyIncome: PropertyIncomeListResult;
  initialFrom?: string;
  initialTo?: string;
  initialOrder?: "asc" | "desc";
  className?: string;
}

export function ReportsPageBody({
  initialSummary,
  initialPropertyIncome,
  initialFrom = "",
  initialTo = "",
  initialOrder = "desc",
  className,
}: ReportsPageBodyProps) {
  const router = useRouter();

  const [from, setFrom] = React.useState<string>(initialFrom);
  const [to, setTo] = React.useState<string>(initialTo);
  const [order, setOrder] = React.useState<"asc" | "desc">(initialOrder);
  const [page, setPage] = React.useState<number>(initialPropertyIncome.page || 1);

  const [summary, setSummary] = React.useState<IncomeSummary>(initialSummary);
  const [propertyIncome, setPropertyIncome] =
    React.useState<PropertyIncomeListResult>(initialPropertyIncome);

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const syncUrl = React.useCallback(
    (newFrom: string, newTo: string, newOrder: "asc" | "desc", newPage: number) => {
      const params = new URLSearchParams();
      if (newFrom) params.set("from", newFrom);
      if (newTo) params.set("to", newTo);
      if (newOrder !== "desc") params.set("order", newOrder);
      if (newPage > 1) params.set("page", String(newPage));

      const query = params.toString();
      const newUrl = query ? `/lessor/reports?${query}` : "/lessor/reports";
      router.replace(newUrl);
    },
    [router]
  );

  const fetchData = React.useCallback(
    async (
      newFrom: string,
      newTo: string,
      newOrder: "asc" | "desc",
      newPage: number
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchReportsDataAction({
          from: newFrom || undefined,
          to: newTo || undefined,
          order: newOrder,
          page: newPage,
          pageSize: 10,
        });

        setSummary(result.summary);
        setPropertyIncome(result.propertyIncome);
        syncUrl(newFrom, newTo, newOrder, newPage);
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
    setPage(1);
    fetchData(nextFrom, nextTo, order, 1);
  };

  const handleClearFilter = () => {
    setFrom("");
    setTo("");
    setPage(1);
    fetchData("", "", order, 1);
  };

  const handleOrderChange = (newOrder: "asc" | "desc") => {
    setOrder(newOrder);
    setPage(1);
    fetchData(from, to, newOrder, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchData(from, to, order, newPage);
  };

  const handleRetry = () => {
    fetchData(from, to, order, page);
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

      <ReportsNav />

      <IncomeSummaryCard
        rentalIncome={summary.rentalIncome}
        retainedDepositIncome={summary.retainedDepositIncome}
        totalIncome={summary.totalIncome}
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
      />

      <PropertyIncomeTable
        items={propertyIncome.data}
        totalPeriodIncome={propertyIncome.totalIncome}
        order={order}
        onOrderChange={handleOrderChange}
        currentPage={propertyIncome.page}
        totalPages={propertyIncome.totalPages}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />
    </main>
  );
}

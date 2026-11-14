'use client';

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { reportMessages } from "@/lib/messages/reports";
import { fetchRatingsDataAction } from "@/app/actions/reports";
import type { PropertyRatingListResult } from "@/lib/repositories/report-repository";
import { ReportsNav } from "./reports-nav";
import { ReportsDateFilter } from "./reports-date-filter";
import { PropertyRatingsTable } from "./property-ratings-table";

export interface RatingsPageBodyProps {
  initialRatings: PropertyRatingListResult;
  initialFrom?: string;
  initialTo?: string;
  initialOrder?: "asc" | "desc";
  className?: string;
}

export function RatingsPageBody({
  initialRatings,
  initialFrom = "",
  initialTo = "",
  initialOrder = "desc",
  className,
}: RatingsPageBodyProps) {
  const router = useRouter();

  const [from, setFrom] = React.useState<string>(initialFrom);
  const [to, setTo] = React.useState<string>(initialTo);
  const [order, setOrder] = React.useState<"asc" | "desc">(initialOrder);
  const [page, setPage] = React.useState<number>(initialRatings.page || 1);
  const [ratings, setRatings] = React.useState<PropertyRatingListResult>(initialRatings);
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
      const newUrl = query
        ? `/owner/reports/ratings?${query}`
        : "/owner/reports/ratings";
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
        const result = await fetchRatingsDataAction({
          from: newFrom || undefined,
          to: newTo || undefined,
          order: newOrder,
          page: newPage,
          pageSize: 10,
        });

        setRatings(result);
        syncUrl(newFrom, newTo, newOrder, newPage);
      } catch (err) {
        console.error("Error fetching ratings:", err);
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

  const handleRefresh = () => {
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

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center space-y-3">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-xl border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            {reportMessages.errors.retryButton}
          </button>
        </div>
      ) : (
        <PropertyRatingsTable
          items={ratings.data}
          order={order}
          onOrderChange={handleOrderChange}
          onRefresh={handleRefresh}
          currentPage={ratings.page}
          totalPages={ratings.totalPages}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      )}
    </main>
  );
}

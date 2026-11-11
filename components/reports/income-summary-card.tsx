import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { reportMessages } from "@/lib/messages/reports";
import { Button } from "@/components/ui/button";

export interface IncomeSummaryCardProps {
  rentalIncome?: string | number;
  retainedDepositIncome?: string | number;
  totalIncome?: string | number;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

export function IncomeSummaryCard({
  rentalIncome = "0.00",
  retainedDepositIncome = "0.00",
  totalIncome = "0.00",
  isLoading = false,
  error = null,
  onRetry,
  className,
}: IncomeSummaryCardProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs animate-pulse space-y-4",
          className
        )}
      >
        <div className="h-5 w-36 bg-zinc-200 rounded-md" />
        <div className="h-10 w-48 bg-zinc-200 rounded-md" />
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-12 pt-2">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-zinc-200 rounded-md" />
            <div className="h-6 w-24 bg-zinc-200 rounded-md" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-zinc-200 rounded-md" />
            <div className="h-6 w-24 bg-zinc-200 rounded-md" />
          </div>
        </div>
        <div className="h-4 w-3/4 bg-zinc-100 rounded-md pt-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-red-200 bg-red-50/50 p-6 sm:p-7 shadow-xs text-center space-y-3",
          className
        )}
      >
        <p className="text-sm font-medium text-red-700">{error}</p>
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            {reportMessages.errors.retryButton}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs space-y-4",
        className
      )}
    >
      <div>
        <h2 className="text-base font-semibold text-zinc-900">
          {reportMessages.summary.title}
        </h2>
        <p className="mt-1 text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
          {reportMessages.formatCurrency(totalIncome)}
        </p>
      </div>

      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-14 pt-1">
        <div>
          <span className="block text-xs sm:text-sm font-medium text-zinc-500">
            {reportMessages.summary.rentalsLabel}
          </span>
          <span className="block text-xl font-bold text-zinc-900 mt-0.5">
            {reportMessages.formatCurrency(rentalIncome)}
          </span>
        </div>

        <div>
          <span className="block text-xs sm:text-sm font-medium text-zinc-500">
            {reportMessages.summary.retainedDepositsLabel}
          </span>
          <span className="block text-xl font-bold text-zinc-900 mt-0.5">
            {reportMessages.formatCurrency(retainedDepositIncome)}
          </span>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-zinc-500 pt-2 leading-relaxed">
        {reportMessages.summary.disclaimer}
      </p>
    </div>
  );
}

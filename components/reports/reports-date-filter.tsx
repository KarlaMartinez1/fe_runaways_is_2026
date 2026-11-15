'use client';

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { reportMessages } from "@/lib/messages/reports";
import {
  occupancyReportFilterSchema,
  reportDateFilterSchema,
  type ReportDateFilterFormData,
} from "@/lib/validations/reports";

export interface ReportsDateFilterProps {
  initialFrom?: string;
  initialTo?: string;
  onApply: (values: { from?: string; to?: string }) => void;
  onClear: () => void;
  isLoading?: boolean;
  helperText?: string;
  checkMaxDays?: boolean;
  className?: string;
}

export function ReportsDateFilter({
  initialFrom = "",
  initialTo = "",
  onApply,
  onClear,
  isLoading = false,
  helperText,
  checkMaxDays = false,
  className,
}: ReportsDateFilterProps) {
  const schema = checkMaxDays ? occupancyReportFilterSchema : reportDateFilterSchema;

  const {
    register,
    handleSubmit,
    reset,
    control,
  } = useForm<ReportDateFilterFormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      from: initialFrom,
      to: initialTo,
    },
  });

  const fromValue = useWatch({ control, name: "from" });
  const toValue = useWatch({ control, name: "to" });

  const todayStr = React.useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const isFutureFrom = Boolean(fromValue && fromValue > todayStr);
  const isFutureTo = Boolean(toValue && toValue > todayStr);
  const isFutureDate = isFutureFrom || isFutureTo;

  const isInvalidRange = Boolean(
    fromValue && toValue && toValue < fromValue
  );

  const isPeriodExceeded = Boolean(
    checkMaxDays &&
      fromValue &&
      toValue &&
      Math.ceil(
        (new Date(toValue).getTime() - new Date(fromValue).getTime()) /
          (1000 * 60 * 60 * 24)
      ) +
        1 >
        365
  );

  const hasValidationError = isFutureDate || isInvalidRange || isPeriodExceeded;

  const onSubmit = (data: ReportDateFilterFormData) => {
    if (hasValidationError) return;
    onApply({
      from: data.from || undefined,
      to: data.to || undefined,
    });
  };

  const handleClear = () => {
    reset({ from: "", to: "" });
    onClear();
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-xs",
        className
      )}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
          <div className="w-full sm:flex-1">
            <label
              htmlFor="filter-from-date"
              className="block text-xs sm:text-sm font-semibold text-zinc-800 mb-1"
            >
              {reportMessages.filter.fromLabel}
            </label>
            <input
              id="filter-from-date"
              type="date"
              max={todayStr}
              {...register("from")}
              placeholder={reportMessages.filter.datePlaceholder}
              className={cn(
                "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors",
                isFutureFrom
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-zinc-300 focus:border-[#1E4DB7] focus:ring-2 focus:ring-blue-100"
              )}
            />
          </div>

          <div className="w-full sm:flex-1">
            <label
              htmlFor="filter-to-date"
              className="block text-xs sm:text-sm font-semibold text-zinc-800 mb-1"
            >
              {reportMessages.filter.toLabel}
            </label>
            <input
              id="filter-to-date"
              type="date"
              max={todayStr}
              {...register("to")}
              placeholder={reportMessages.filter.datePlaceholder}
              className={cn(
                "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors",
                hasValidationError && (isFutureTo || isInvalidRange || isPeriodExceeded)
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-zinc-300 focus:border-[#1E4DB7] focus:ring-2 focus:ring-blue-100"
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 sm:pt-0 sm:flex sm:items-center sm:gap-2">
            <Button
              type="submit"
              disabled={hasValidationError || isLoading}
              isLoading={isLoading}
              size="md"
              className="w-full sm:w-auto bg-[#1E4DB7] hover:bg-blue-800 text-white font-medium px-5 sm:px-6 h-11 rounded-xl"
            >
              {reportMessages.filter.applyButton}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={isLoading}
              size="md"
              className="w-full sm:w-auto border-zinc-300 text-zinc-800 hover:bg-zinc-50 font-medium px-5 sm:px-6 h-11 rounded-xl"
            >
              {reportMessages.filter.clearButton}
            </Button>
          </div>
        </div>

        {isFutureDate && (
          <p className="text-xs text-red-600 font-medium pt-0.5">
            {reportMessages.filter.futureDateNotAllowed}
          </p>
        )}

        {isInvalidRange && !isFutureDate && (
          <p className="text-xs text-red-600 font-medium pt-0.5">
            {reportMessages.filter.invalidDateRange}
          </p>
        )}

        {isPeriodExceeded && !isFutureDate && !isInvalidRange && (
          <p className="text-xs text-red-600 font-medium pt-0.5">
            {reportMessages.filter.periodExceeded}
          </p>
        )}

        {helperText && !hasValidationError && (
          <p className="text-xs text-zinc-500 pt-0.5 leading-relaxed">
            {helperText}
          </p>
        )}
      </form>
    </div>
  );
}

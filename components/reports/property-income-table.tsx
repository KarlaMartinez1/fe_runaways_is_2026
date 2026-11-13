'use client';

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { reportMessages } from "@/lib/messages/reports";
import type { PropertyIncomeItem } from "@/lib/repositories/report-repository";
import type { PropertyStatus } from "@/lib/api/types";

export interface PropertyIncomeTableProps {
  items: PropertyIncomeItem[];
  totalPeriodIncome: string | number;
  order: "asc" | "desc";
  onOrderChange: (order: "asc" | "desc") => void;
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  className?: string;
}

const statusBadgeConfig: Record<PropertyStatus, { variant: BadgeVariant; label: string }> = {
  DISPONIBLE: {
    variant: "success",
    label: reportMessages.statuses.DISPONIBLE,
  },
  PAUSADO: {
    variant: "warning",
    label: reportMessages.statuses.PAUSADO,
  },
  ELIMINADO: {
    variant: "neutral",
    label: reportMessages.statuses.ELIMINADO,
  },
};

export function PropertyIncomeTable({
  items,
  totalPeriodIncome,
  order,
  onOrderChange,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  className,
}: PropertyIncomeTableProps) {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-4 sm:p-7 shadow-xs space-y-5 sm:space-y-6",
        className
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
            {reportMessages.byProperty.title}
          </h2>

          <div className="w-full sm:w-auto sm:min-w-[215px]">
            <Select
              id="income-order-select"
              value={order}
              onChange={(val) => onOrderChange(val as "asc" | "desc")}
              disabled={isLoading}
              aria-label={reportMessages.byProperty.orderLabel}
              options={[
                { value: "desc", label: reportMessages.byProperty.orderDesc },
                { value: "asc", label: reportMessages.byProperty.orderAsc },
              ]}
            />
          </div>
        </div>

        <p className="text-sm font-semibold text-[#1E4DB7]">
          {reportMessages.byProperty.periodTotal(
            reportMessages.formatCurrency(totalPeriodIncome)
          )}
        </p>
      </div>

      <div className="space-y-3.5 md:hidden">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-zinc-400 animate-pulse">
            Cargando información...
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-sm text-zinc-500">
            {reportMessages.byProperty.noProperties}
          </div>
        ) : (
          items.map((item, index) => {
            const badgeInfo = statusBadgeConfig[item.status] ?? {
              variant: "neutral",
              label: item.status,
            };

            return (
              <div
                key={`${item.propertyId}-${item.lastIncomeDate ?? "sin-fecha"}-${index}`}
                className="rounded-2xl bg-[#F9FAFB] p-4 sm:p-5 space-y-2.5 transition-shadow"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm sm:text-base text-zinc-900">
                    {item.title}
                  </span>
                  <Badge variant={badgeInfo.variant} size="sm">
                    {badgeInfo.label}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span>{reportMessages.byProperty.headers.rentals}</span>
                    <span className="font-medium text-zinc-800">
                      {reportMessages.formatCurrency(item.rentalIncome)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-500">
                    <span>{reportMessages.byProperty.headers.retainedDeposits}</span>
                    <span className="font-medium text-zinc-800">
                      {reportMessages.formatCurrency(item.retainedDepositIncome)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-500 pt-0.5">
                    <span>{reportMessages.byProperty.headers.totalIncome}</span>
                    <span className="font-bold text-zinc-900 text-sm sm:text-base">
                      {reportMessages.formatCurrency(item.totalIncome)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="hidden md:block overflow-x-auto -mx-5 sm:mx-0">
        <table className="w-full text-left border-collapse text-sm text-zinc-700 min-w-[640px]">
          <thead>
            <tr className="border-b border-zinc-200 text-xs sm:text-sm font-semibold text-zinc-500">
              <th scope="col" className="py-3 px-4 sm:px-2 font-semibold">
                {reportMessages.byProperty.headers.property}
              </th>
              <th scope="col" className="py-3 px-4 font-semibold text-center">
                {reportMessages.byProperty.headers.lastIncome}
              </th>
              <th scope="col" className="py-3 px-4 font-semibold text-center">
                {reportMessages.byProperty.headers.status}
              </th>
              <th scope="col" className="py-3 px-4 font-semibold text-right">
                {reportMessages.byProperty.headers.rentals}
              </th>
              <th scope="col" className="py-3 px-4 font-semibold text-right">
                {reportMessages.byProperty.headers.retainedDeposits}
              </th>
              <th scope="col" className="py-3 px-4 sm:px-2 font-semibold text-right">
                {reportMessages.byProperty.headers.totalIncome}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-zinc-400 animate-pulse">
                  Cargando información...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-zinc-500">
                  {reportMessages.byProperty.noProperties}
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const badgeInfo = statusBadgeConfig[item.status] ?? {
                  variant: "neutral",
                  label: item.status,
                };

                return (
                  <tr
                    key={`${item.propertyId}-${item.lastIncomeDate ?? "sin-fecha"}-${index}`}
                    className="hover:bg-zinc-50/70 transition-colors"
                  >
                    <td className="py-4 px-4 sm:px-2 font-medium text-zinc-900">
                      {item.title}
                    </td>
                    <td className="py-4 px-4 text-center text-zinc-600">
                      {item.lastIncomeDate ?? reportMessages.byProperty.noIncome}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant={badgeInfo.variant} size="sm">
                        {badgeInfo.label}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right text-zinc-700 font-medium">
                      {reportMessages.formatCurrency(item.rentalIncome)}
                    </td>
                    <td className="py-4 px-4 text-right text-zinc-700 font-medium">
                      {reportMessages.formatCurrency(item.retainedDepositIncome)}
                    </td>
                    <td className="py-4 px-4 sm:px-2 text-right font-bold text-zinc-900">
                      {reportMessages.formatCurrency(item.totalIncome)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <div className="flex items-center justify-between sm:justify-center sm:gap-4 pt-2">
          <button
            type="button"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={!hasPrevious || isLoading}
            className={cn(
              "rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs sm:text-sm font-medium transition-colors select-none",
              hasPrevious && !isLoading
                ? "text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 cursor-pointer shadow-xs"
                : "text-zinc-300 border-zinc-100 cursor-not-allowed bg-zinc-50/50"
            )}
          >
            Anterior
          </button>

          <span className="text-xs sm:text-sm text-zinc-500 font-medium">
            Página {currentPage} de {totalPages}
          </span>

          <button
            type="button"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={!hasNext || isLoading}
            className={cn(
              "rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs sm:text-sm font-medium transition-colors select-none",
              hasNext && !isLoading
                ? "text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 cursor-pointer shadow-xs"
                : "text-zinc-300 border-zinc-100 cursor-not-allowed bg-zinc-50/50"
            )}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { reportMessages } from "@/lib/messages/reports";
import type { PropertyOccupancyItem } from "@/lib/repositories/report-repository";

export interface PropertyOccupancyTableProps {
  items: PropertyOccupancyItem[];
  from?: string;
  to?: string;
  periodDays?: number;
  order: "asc" | "desc";
  onOrderChange: (order: "asc" | "desc") => void;
  onRefresh: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  className?: string;
}

const statusBadgeConfig: Record<string, { variant: BadgeVariant; label: string }> = {
  DISPONIBLE: {
    variant: "success",
    label: reportMessages.statuses.DISPONIBLE,
  },
  AVAILABLE: {
    variant: "success",
    label: reportMessages.statuses.DISPONIBLE,
  },
  PAUSADO: {
    variant: "warning",
    label: reportMessages.statuses.PAUSADO,
  },
  PAUSED: {
    variant: "warning",
    label: reportMessages.statuses.PAUSADO,
  },
  ELIMINADO: {
    variant: "neutral",
    label: reportMessages.statuses.ELIMINADO,
  },
  DELETED: {
    variant: "neutral",
    label: reportMessages.statuses.ELIMINADO,
  },
};

export function PropertyOccupancyTable({
  items,
  from = "",
  to = "",
  periodDays = 30,
  order,
  onOrderChange,
  onRefresh,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  className,
}: PropertyOccupancyTableProps) {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7 shadow-xs space-y-5 sm:space-y-6",
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
            {reportMessages.occupancy.title}
          </h2>
          {from && to && (
            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
              {reportMessages.occupancy.periodApplied(from, to, periodDays)}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="w-full sm:w-auto sm:min-w-[215px]">
            <Select
              id="occupancy-order-select"
              value={order}
              onChange={(val) => onOrderChange(val as "asc" | "desc")}
              disabled={isLoading}
              aria-label={reportMessages.occupancy.orderLabel}
              options={[
                { value: "desc", label: reportMessages.occupancy.orderDesc },
                { value: "asc", label: reportMessages.occupancy.orderAsc },
              ]}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onRefresh}
            disabled={isLoading}
            isLoading={isLoading}
            size="md"
            className="w-fit border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 font-semibold px-6 h-11 rounded-xl"
          >
            {isLoading
              ? reportMessages.ratings.updatingButton
              : reportMessages.ratings.updateButton}
          </Button>
        </div>
      </div>

      {/* Vista móvil: Cards */}
      <div className="space-y-3.5 md:hidden">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-zinc-400 animate-pulse">
            Cargando tasa de ocupación...
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
                key={`${item.propertyId}-${index}`}
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

                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-zinc-500 font-medium">
                    {reportMessages.occupancy.headers.occupiedDays}
                  </span>
                  <span className="text-zinc-700 font-medium">
                    {item.occupiedDays} {item.occupiedDays === 1 ? "día" : "días"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-zinc-500 font-medium">
                    {reportMessages.occupancy.headers.periodDays}
                  </span>
                  <span className="text-zinc-600 font-medium">
                    {item.periodDays} {item.periodDays === 1 ? "día" : "días"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm pt-1 border-t border-zinc-200/60">
                  <span className="text-zinc-500 font-medium">
                    {reportMessages.occupancy.headers.occupancyRate}
                  </span>
                  <span className="font-bold text-blue-700 text-sm sm:text-base">
                    {reportMessages.occupancy.formatRate(item.occupancyRate)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Vista desktop: Tabla */}
      <div className="hidden md:block overflow-x-auto -mx-5 sm:-mx-7 px-5 sm:px-7">
        <table className="w-full text-left text-sm text-zinc-600">
          <thead className="border-b border-zinc-200 text-xs font-semibold text-zinc-400">
            <tr>
              <th scope="col" className="py-3 px-4 sm:px-2 font-semibold">
                {reportMessages.occupancy.headers.property}
              </th>
              <th scope="col" className="py-3 px-4 text-center font-semibold">
                {reportMessages.occupancy.headers.status}
              </th>
              <th scope="col" className="py-3 px-4 text-right font-semibold">
                {reportMessages.occupancy.headers.occupiedDays}
              </th>
              <th scope="col" className="py-3 px-4 text-right font-semibold">
                {reportMessages.occupancy.headers.periodDays}
              </th>
              <th scope="col" className="py-3 px-4 sm:px-2 text-right font-semibold">
                {reportMessages.occupancy.headers.occupancyRate}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-zinc-400 animate-pulse">
                  Cargando tasa de ocupación...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-zinc-500">
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
                    key={`${item.propertyId}-${index}`}
                    className="hover:bg-zinc-50/70 transition-colors"
                  >
                    <td className="py-4 px-4 sm:px-2 font-medium text-zinc-900">
                      {item.title}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant={badgeInfo.variant} size="sm">
                        {badgeInfo.label}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right text-zinc-700 font-medium">
                      {item.occupiedDays}
                    </td>
                    <td className="py-4 px-4 text-right text-zinc-600">
                      {item.periodDays}
                    </td>
                    <td className="py-4 px-4 sm:px-2 text-right font-bold text-blue-700">
                      {reportMessages.occupancy.formatRate(item.occupancyRate)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
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

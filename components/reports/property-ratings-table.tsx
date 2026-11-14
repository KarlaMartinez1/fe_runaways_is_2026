'use client';

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { reportMessages } from "@/lib/messages/reports";
import type { PropertyRatingItem } from "@/lib/repositories/report-repository";
import type { PropertyStatus } from "@/lib/api/types";

export interface PropertyRatingsTableProps {
  items: PropertyRatingItem[];
  order: "asc" | "desc";
  onOrderChange: (order: "asc" | "desc") => void;
  onRefresh: () => void;
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

export function PropertyRatingsTable({
  items,
  order,
  onOrderChange,
  onRefresh,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  className,
}: PropertyRatingsTableProps) {
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
        <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
          {reportMessages.ratings.title}
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="w-full sm:w-auto sm:min-w-[215px]">
            <Select
              id="ratings-order-select"
              value={order}
              onChange={(val) => onOrderChange(val as "asc" | "desc")}
              disabled={isLoading}
              aria-label={reportMessages.ratings.orderLabel}
              options={[
                { value: "desc", label: reportMessages.ratings.orderDesc },
                { value: "asc", label: reportMessages.ratings.orderAsc },
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

      <div className="space-y-3.5 md:hidden">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-zinc-400 animate-pulse">
            Cargando calificaciones...
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
                key={`${item.propertyId}-${item.lastReviewDate ?? "sin-fecha"}-${index}`}
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
                    {reportMessages.ratings.headers.reviewDate}
                  </span>
                  <span className="text-zinc-600 font-medium">
                    {item.lastReviewDate ?? reportMessages.ratings.noReviewsDate}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-zinc-500 font-medium">
                    {reportMessages.ratings.cardRatingLabel}
                  </span>
                  <span className="font-bold text-zinc-900 text-sm sm:text-base">
                    {reportMessages.ratings.formatRatingWithReviews(
                      item.averageRating,
                      item.reviewCount
                    )}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="hidden md:block overflow-x-auto -mx-5 sm:mx-0">
        <table className="w-full text-left border-collapse text-sm text-zinc-700 min-w-[500px]">
          <thead>
            <tr className="border-b border-zinc-200 text-xs sm:text-sm font-semibold text-zinc-500">
              <th scope="col" className="py-3 px-4 sm:px-2 font-semibold">
                {reportMessages.ratings.headers.property}
              </th>
              <th scope="col" className="py-3 px-4 font-semibold text-center">
                {reportMessages.ratings.headers.reviewDate}
              </th>
              <th scope="col" className="py-3 px-4 font-semibold text-center">
                {reportMessages.ratings.headers.status}
              </th>
              <th scope="col" className="py-3 px-4 sm:px-2 font-semibold text-right">
                {reportMessages.ratings.headers.averageRating}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-zinc-400 animate-pulse">
                  Cargando calificaciones...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-sm text-zinc-500">
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
                    key={`${item.propertyId}-${item.lastReviewDate ?? "sin-fecha"}-${index}`}
                    className="hover:bg-zinc-50/70 transition-colors"
                  >
                    <td className="py-4 px-4 sm:px-2 font-medium text-zinc-900">
                      {item.title}
                    </td>
                    <td className="py-4 px-4 text-center text-zinc-600">
                      {item.lastReviewDate ?? reportMessages.ratings.noReviewsDate}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant={badgeInfo.variant} size="sm">
                        {badgeInfo.label}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 sm:px-2 text-right">
                      <span
                        className={cn(
                          item.averageRating !== null
                            ? "font-bold text-zinc-900"
                            : "font-semibold text-zinc-700"
                        )}
                      >
                        {reportMessages.ratings.formatRatingWithReviews(
                          item.averageRating,
                          item.reviewCount
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs sm:text-sm text-zinc-500 pt-1 leading-relaxed">
        {reportMessages.ratings.readOnlyNotice}
      </p>

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

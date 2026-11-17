'use client';

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/components/ui/calendar-view";
import { buildAvailabilityCalendarModel } from "@/lib/calendar/availability-calendar";
import { availabilityMessages } from "@/lib/messages/properties";
import { reportMessages } from "@/lib/messages/reports";
import {
  shiftMonthKey,
  toMonthKey,
  todayInElSalvador,
} from "@/lib/utils/dates";
import {
  occupancyReportFilterSchema,
  ratingsReportFilterSchema,
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
  disallowFutureDates?: boolean;
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
  disallowFutureDates = false,
  className,
}: ReportsDateFilterProps) {
  const schema = checkMaxDays
    ? occupancyReportFilterSchema
    : disallowFutureDates
      ? ratingsReportFilterSchema
      : reportDateFilterSchema;

  const {
    handleSubmit,
    reset,
    control,
    setValue,
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

  const todayStr = React.useMemo(() => todayInElSalvador(), []);
  const maxCalendarDate = disallowFutureDates ? todayStr : "2030-12-31";

  const [openFrom, setOpenFrom] = React.useState(false);
  const [openTo, setOpenTo] = React.useState(false);

  const [fromVisibleMonth, setFromVisibleMonth] = React.useState<string>(() =>
    toMonthKey(initialFrom || todayStr)
  );
  const [toVisibleMonth, setToVisibleMonth] = React.useState<string>(() =>
    toMonthKey(initialTo || initialFrom || todayStr)
  );

  const fromContainerRef = React.useRef<HTMLDivElement>(null);
  const toContainerRef = React.useRef<HTMLDivElement>(null);

  // Close calendar popovers on outside click or Escape
  React.useEffect(() => {
    if (!openFrom && !openTo) return;

    const handlePointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (openFrom && !fromContainerRef.current?.contains(target)) {
        setOpenFrom(false);
      }
      if (openTo && !toContainerRef.current?.contains(target)) {
        setOpenTo(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenFrom(false);
        setOpenTo(false);
      }
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openFrom, openTo]);

  const handleOpenFrom = () => {
    if (fromValue && /^\d{4}-\d{2}-\d{2}$/.test(fromValue)) {
      setFromVisibleMonth(toMonthKey(fromValue));
    }
    setOpenFrom((prev) => !prev);
    setOpenTo(false);
  };

  const handleOpenTo = () => {
    if (toValue && /^\d{4}-\d{2}-\d{2}$/.test(toValue)) {
      setToVisibleMonth(toMonthKey(toValue));
    } else if (fromValue && /^\d{4}-\d{2}-\d{2}$/.test(fromValue)) {
      setToVisibleMonth(toMonthKey(fromValue));
    }
    setOpenTo((prev) => !prev);
    setOpenFrom(false);
  };

  const isFutureFrom = Boolean(disallowFutureDates && fromValue && fromValue > todayStr);
  const isFutureTo = Boolean(disallowFutureDates && toValue && toValue > todayStr);
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
    setFromVisibleMonth(toMonthKey(todayStr));
    setToVisibleMonth(toMonthKey(todayStr));
    setOpenFrom(false);
    setOpenTo(false);
    onClear();
  };

  const occupiedDates = React.useMemo(() => new Set<string>(), []);

  const fromCalendarModel = React.useMemo(() => {
    return buildAvailabilityCalendarModel({
      visibleMonth: fromVisibleMonth,
      from: "2020-01-01",
      to: maxCalendarDate,
      occupiedDates,
      selectedStart: fromValue || null,
      selectedEnd: toValue || null,
    });
  }, [fromVisibleMonth, maxCalendarDate, occupiedDates, fromValue, toValue]);

  const toCalendarModel = React.useMemo(() => {
    return buildAvailabilityCalendarModel({
      visibleMonth: toVisibleMonth,
      from: "2020-01-01",
      to: maxCalendarDate,
      occupiedDates,
      selectedStart: fromValue || null,
      selectedEnd: toValue || null,
    });
  }, [toVisibleMonth, maxCalendarDate, occupiedDates, fromValue, toValue]);

  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-xs",
        className
      )}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
          {/* Desde field */}
          <div ref={fromContainerRef} className="relative w-full sm:flex-1">
            <label
              htmlFor="filter-from-date"
              className="block text-xs sm:text-sm font-semibold text-zinc-800 mb-1"
            >
              {reportMessages.filter.fromLabel}
            </label>
            <div className="relative">
              <input
                id="filter-from-date"
                type="text"
                readOnly
                value={fromValue || ""}
                onClick={handleOpenFrom}
                placeholder={reportMessages.filter.datePlaceholder}
                className={cn(
                  "w-full cursor-pointer rounded-xl border bg-white px-3.5 py-2.5 pr-14 text-sm text-zinc-900 outline-none transition-colors",
                  isFutureFrom
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-zinc-300 focus:border-[#1E4DB7] focus:ring-2 focus:ring-blue-100"
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {fromValue && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setValue("from", "", { shouldValidate: true, shouldDirty: true });
                    }}
                    className="text-zinc-400 hover:text-zinc-600 focus:outline-none p-0.5 rounded"
                    aria-label="Limpiar fecha desde"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleOpenFrom}
                  className="text-zinc-400 hover:text-zinc-600 focus:outline-none"
                  aria-haspopup="dialog"
                  aria-expanded={openFrom}
                  aria-label="Abrir calendario para fecha desde"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </button>
              </div>
            </div>

            {openFrom && (
              <div
                role="dialog"
                aria-label="Seleccionar fecha desde"
                className="absolute left-0 top-full z-40 mt-2 w-72 sm:w-80 rounded-xl border border-zinc-200 bg-white shadow-2xl p-1"
              >
                <CalendarView
                  monthTitle={fromCalendarModel.monthTitle}
                  weekdays={availabilityMessages.weekdays}
                  calendarLabel="Calendario de fecha de inicio"
                  previousMonthLabel={availabilityMessages.previousMonth}
                  nextMonthLabel={availabilityMessages.nextMonth}
                  canGoPrevious={fromVisibleMonth > "2020-01"}
                  canGoNext={fromVisibleMonth < toMonthKey(maxCalendarDate)}
                  cells={fromCalendarModel.cells}
                  selectionLabel="Fecha seleccionada"
                  onPreviousMonth={() => setFromVisibleMonth((m) => shiftMonthKey(m, -1))}
                  onNextMonth={() => setFromVisibleMonth((m) => shiftMonthKey(m, 1))}
                  onSelectDate={(iso) => {
                    setValue("from", iso, { shouldValidate: true, shouldDirty: true });
                    setOpenFrom(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Hasta field */}
          <div ref={toContainerRef} className="relative w-full sm:flex-1">
            <label
              htmlFor="filter-to-date"
              className="block text-xs sm:text-sm font-semibold text-zinc-800 mb-1"
            >
              {reportMessages.filter.toLabel}
            </label>
            <div className="relative">
              <input
                id="filter-to-date"
                type="text"
                readOnly
                value={toValue || ""}
                onClick={handleOpenTo}
                placeholder={reportMessages.filter.datePlaceholder}
                className={cn(
                  "w-full cursor-pointer rounded-xl border bg-white px-3.5 py-2.5 pr-14 text-sm text-zinc-900 outline-none transition-colors",
                  hasValidationError && (isFutureTo || isInvalidRange || isPeriodExceeded)
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-zinc-300 focus:border-[#1E4DB7] focus:ring-2 focus:ring-blue-100"
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {toValue && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setValue("to", "", { shouldValidate: true, shouldDirty: true });
                    }}
                    className="text-zinc-400 hover:text-zinc-600 focus:outline-none p-0.5 rounded"
                    aria-label="Limpiar fecha hasta"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleOpenTo}
                  className="text-zinc-400 hover:text-zinc-600 focus:outline-none"
                  aria-haspopup="dialog"
                  aria-expanded={openTo}
                  aria-label="Abrir calendario para fecha hasta"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </button>
              </div>
            </div>

            {openTo && (
              <div
                role="dialog"
                aria-label="Seleccionar fecha hasta"
                className="absolute left-0 sm:left-auto sm:right-0 top-full z-40 mt-2 w-72 sm:w-80 rounded-xl border border-zinc-200 bg-white shadow-2xl p-1"
              >
                <CalendarView
                  monthTitle={toCalendarModel.monthTitle}
                  weekdays={availabilityMessages.weekdays}
                  calendarLabel="Calendario de fecha de fin"
                  previousMonthLabel={availabilityMessages.previousMonth}
                  nextMonthLabel={availabilityMessages.nextMonth}
                  canGoPrevious={toVisibleMonth > "2020-01"}
                  canGoNext={toVisibleMonth < toMonthKey(maxCalendarDate)}
                  cells={toCalendarModel.cells}
                  selectionLabel="Fecha seleccionada"
                  onPreviousMonth={() => setToVisibleMonth((m) => shiftMonthKey(m, -1))}
                  onNextMonth={() => setToVisibleMonth((m) => shiftMonthKey(m, 1))}
                  onSelectDate={(iso) => {
                    setValue("to", iso, { shouldValidate: true, shouldDirty: true });
                    setOpenTo(false);
                  }}
                />
              </div>
            )}
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

"use client";

import { useEffect, useRef, useState } from "react";
import { availabilityMessages, searchMessages } from "@/lib/messages/properties";
import { cn } from "@/lib/utils/cn";
import {
  addDaysIso,
  buildMonthCells,
  formatLongDate,
  formatMonthTitle,
  shiftMonthKey,
  toMonthKey,
} from "@/lib/utils/dates";

type DateRangeFieldProps = {
  labelledBy: string;
  startDate: string;
  endDate: string;
  minDate: string;
  maxDate: string;
  maxDays: number;
  onChange: (startDate: string, endDate: string) => void;
};

function toDisplay(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export function DateRangeField({
  labelledBy,
  startDate,
  endDate,
  minDate,
  maxDate,
  maxDays,
  onChange,
}: DateRangeFieldProps) {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => toMonthKey(startDate || minDate));
  const containerRef = useRef<HTMLDivElement>(null);

  // Cierra el calendario al hacer clic fuera de él o al presionar Escape.
  useEffect(() => {
    if (!open) return;

    const handlePointer = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // Mientras se elige el fin, no se permite pasar de 30 días desde el inicio (H8).
  const selectingEnd = Boolean(startDate) && !endDate;
  const endLimit = selectingEnd ? [addDaysIso(startDate, maxDays - 1), maxDate].sort()[0] : maxDate;

  const isDisabled = (iso: string) => {
    if (iso < minDate || iso > maxDate) return true;
    return selectingEnd && iso > endLimit;
  };

  // Primer clic: inicio. Segundo clic: fin. Un clic antes del inicio empieza de nuevo.
  const handleSelect = (iso: string) => {
    if (!startDate || endDate || iso < startDate) {
      onChange(iso, "");
      return;
    }
    onChange(startDate, iso);
    setOpen(false);
  };

  const label =
    startDate && endDate
      ? `${toDisplay(startDate)} – ${toDisplay(endDate)}`
      : startDate
        ? `${toDisplay(startDate)} – ${searchMessages.dateChooseEnd}`
        : searchMessages.datesPlaceholder;

  const cells = buildMonthCells(visibleMonth);
  const canGoPrevious = visibleMonth > toMonthKey(minDate);
  const canGoNext = visibleMonth < toMonthKey(maxDate);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={labelledBy}
        aria-describedby={`${labelledBy}-value`}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-gray-300 bg-white px-3.5 text-left text-sm outline-none hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      >
        <span id={`${labelledBy}-value`} className={startDate ? "text-gray-900" : "text-gray-400"}>
          {label}
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0 text-gray-500" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={searchMessages.datesLabel}
          className="absolute right-0 z-30 mt-2 flex w-72 flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setVisibleMonth((month) => shiftMonthKey(month, -1))}
              disabled={!canGoPrevious}
              aria-label={availabilityMessages.previousMonth}
              className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent"
            >
              ‹
            </button>
            <p aria-live="polite" className="text-sm font-semibold text-zinc-900">
              {formatMonthTitle(visibleMonth)}
            </p>
            <button
              type="button"
              onClick={() => setVisibleMonth((month) => shiftMonthKey(month, 1))}
              disabled={!canGoNext}
              aria-label={availabilityMessages.nextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500" aria-hidden="true">
            {availabilityMessages.weekdays.map((weekday, index) => (
              <span key={`${weekday}-${index}`}>{weekday}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((iso, index) => {
              if (!iso) {
                return <span key={`blank-${index}`} aria-hidden="true" />;
              }

              const disabled = isDisabled(iso);
              const isEdge = iso === startDate || iso === endDate;
              const isBetween = Boolean(startDate && endDate && iso > startDate && iso < endDate);

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  aria-pressed={isEdge}
                  aria-label={formatLongDate(iso)}
                  onClick={() => handleSelect(iso)}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-lg text-[13px] transition-colors",
                    isEdge && "bg-[#2449c6] font-semibold text-white",
                    isBetween && "bg-[#E5EBFB] text-[#2449c6]",
                    !isEdge && !isBetween && !disabled && "text-zinc-800 hover:bg-zinc-100",
                    disabled && "cursor-not-allowed text-zinc-300",
                  )}
                >
                  {Number(iso.slice(8, 10))}
                </button>
              );
            })}
          </div>

          {startDate && (
            <button
              type="button"
              onClick={() => onChange("", "")}
              className="self-end text-xs text-zinc-600 underline underline-offset-2 hover:no-underline"
            >
              {searchMessages.clearDates}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
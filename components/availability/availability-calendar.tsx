"use client";

import { useState } from "react";
import { availabilityMessages } from "@/lib/messages/properties";
import { cn } from "@/lib/utils/cn";
import {
  buildMonthCells,
  formatLongDate,
  formatMonthTitle,
  shiftMonthKey,
  toMonthKey,
} from "@/lib/utils/dates";

type AvailabilityCalendarProps = {
  from: string;
  to: string;
  occupiedDates: string[];
};

type DayStatus = "free" | "occupied" | "disabled";

const dayStyles: Record<DayStatus, string> = {
  free: "bg-[#d9f5e3] font-medium text-[#14532d]",
  occupied: "bg-zinc-200 font-medium text-zinc-500 line-through",
  disabled: "text-zinc-300",
};

const statusLabels: Record<DayStatus, string> = {
  free: availabilityMessages.free,
  occupied: availabilityMessages.occupied,
  disabled: availabilityMessages.outOfRange,
};

function getDayStatus(iso: string, from: string, to: string, occupied: Set<string>): DayStatus {
  if (iso < from || iso > to) return "disabled";
  return occupied.has(iso) ? "occupied" : "free";
}

export function AvailabilityCalendar({ from, to, occupiedDates }: AvailabilityCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => toMonthKey(from));

  const occupied = new Set(occupiedDates);
  const cells = buildMonthCells(visibleMonth);
  const canGoPrevious = visibleMonth > toMonthKey(from);
  const canGoNext = visibleMonth < toMonthKey(to);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
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

      <div role="group" aria-label={availabilityMessages.calendarLabel} className="flex flex-col gap-1">
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

            const status = getDayStatus(iso, from, to, occupied);
            const day = Number(iso.slice(8, 10));

            return (
              <span
                key={iso}
                className={cn(
                  "flex h-9 items-center justify-center rounded-lg text-[13px]",
                  dayStyles[status],
                )}
              >
                <span aria-hidden="true">{day}</span>
                <span className="sr-only">{`${formatLongDate(iso)}: ${statusLabels[status]}`}</span>
              </span>
            );
          })}
        </div>
      </div>

      <ul className="flex flex-wrap gap-4 border-t border-zinc-100 pt-3 text-xs text-zinc-600">
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-3 rounded-sm border border-[#22c55e] bg-[#d9f5e3]" />
          {availabilityMessages.free}
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-zinc-200" />
          {availabilityMessages.occupied}
        </li>
      </ul>
    </div>
  );
}
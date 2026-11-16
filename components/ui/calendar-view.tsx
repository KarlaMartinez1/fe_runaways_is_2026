import type { CalendarCell } from "@/lib/calendar/availability-calendar";
import { availabilityMessages } from "@/lib/messages/properties";
import { cn } from "@/lib/utils/cn";

type CalendarViewProps = {
  monthTitle: string;
  weekdays: string[];
  calendarLabel: string;
  previousMonthLabel: string;
  nextMonthLabel: string;
  canGoPrevious: boolean;
  canGoNext: boolean;
  cells: CalendarCell[];
  selectionLabel: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectDate?: (iso: string) => void;
};

const statusStyles = {
  free: "bg-[#d9f5e3] font-medium text-[#14532d]",
  occupied: "bg-zinc-200 font-medium text-zinc-500 line-through",
  disabled: "text-zinc-300",
} as const;

const selectionStyles = {
  edge: "bg-[#1f4fb8] font-semibold text-white",
  between: "bg-[#d3dcf2] font-medium text-[#3d4a6b]",
} as const;

export function CalendarView({
  monthTitle,
  weekdays,
  calendarLabel,
  previousMonthLabel,
  nextMonthLabel,
  canGoPrevious,
  canGoNext,
  cells,
  selectionLabel,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
}: CalendarViewProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPreviousMonth}
          disabled={!canGoPrevious}
          aria-label={previousMonthLabel}
          className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent"
        >
          ‹
        </button>

        <p aria-live="polite" className="text-sm font-semibold text-zinc-900">
          {monthTitle}
        </p>

        <button
          type="button"
          onClick={onNextMonth}
          disabled={!canGoNext}
          aria-label={nextMonthLabel}
          className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent"
        >
          ›
        </button>
      </div>

      <div role="group" aria-label={calendarLabel} className="flex flex-col gap-1">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500" aria-hidden="true">
          {weekdays.map((weekday, index) => (
            <span key={`${weekday}-${index}`}>{weekday}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell) => {
            const className = cn(
              "flex h-9 items-center justify-center rounded-lg text-[13px] transition-colors",
              cell.selection ? selectionStyles[cell.selection] : statusStyles[cell.status],
              cell.status === "free" && onSelectDate &&
                "cursor-pointer hover:ring-2 hover:ring-[#22c55e]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
            );

            if (cell.iso && cell.status === "free" && onSelectDate) {
              return (
                <button key={cell.key} type="button" onClick={() => onSelectDate(cell.iso!)} className={className}>
                  <span aria-hidden="true">{cell.day}</span>
                  <span className="sr-only">{cell.accessibleLabel}</span>
                </button>
              );
            }

            return (
              <span key={cell.key} className={className} aria-hidden={cell.iso === null || undefined}>
                {cell.day !== null && <span aria-hidden="true">{cell.day}</span>}
                {cell.accessibleLabel && <span className="sr-only">{cell.accessibleLabel}</span>}
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
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-[#1f4fb8]" />
          {selectionLabel}
        </li>
      </ul>
    </div>
  );
}

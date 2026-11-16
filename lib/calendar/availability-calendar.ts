import { availabilityMessages } from "@/lib/messages/properties";
import {
  buildMonthCells,
  formatLongDate,
  formatMonthTitle,
} from "@/lib/utils/dates";

export type CalendarDayStatus = "free" | "occupied" | "disabled";
export type CalendarSelectionKind = "edge" | "between";

export type CalendarCell = {
  key: string;
  iso: string | null;
  day: number | null;
  status: CalendarDayStatus;
  selection: CalendarSelectionKind | null;
  accessibleLabel?: string;
};

type AvailabilityCalendarModelInput = {
  visibleMonth: string;
  from: string;
  to: string;
  occupiedDates: ReadonlySet<string>;
  selectedStart: string | null;
  selectedEnd: string | null;
};

export function getCalendarDayStatus(
  iso: string,
  from: string,
  to: string,
  occupiedDates: ReadonlySet<string>,
): CalendarDayStatus {
  if (iso < from || iso > to) return "disabled";
  return occupiedDates.has(iso) ? "occupied" : "free";
}

export function getCalendarSelection(
  iso: string,
  selectedStart: string | null,
  selectedEnd: string | null,
): CalendarSelectionKind | null {
  if (!selectedStart) return null;
  if (iso === selectedStart || iso === selectedEnd) return "edge";
  if (selectedEnd && iso > selectedStart && iso < selectedEnd) return "between";
  return null;
}

export function buildAvailabilityCalendarModel({
  visibleMonth,
  from,
  to,
  occupiedDates,
  selectedStart,
  selectedEnd,
}: AvailabilityCalendarModelInput): {
  monthTitle: string;
  cells: CalendarCell[];
} {
  const cells = buildMonthCells(visibleMonth).map((iso, index): CalendarCell => {
    if (!iso) {
      return {
        key: `blank-${index}`,
        iso: null,
        day: null,
        status: "disabled",
        selection: null,
      };
    }

    const status = getCalendarDayStatus(iso, from, to, occupiedDates);
    return {
      key: iso,
      iso,
      day: Number(iso.slice(8, 10)),
      status,
      selection: getCalendarSelection(iso, selectedStart, selectedEnd),
      accessibleLabel: `${formatLongDate(iso)}: ${availabilityMessages[status === "free" ? "free" : status === "occupied" ? "occupied" : "outOfRange"]}`,
    };
  });

  return { monthTitle: formatMonthTitle(visibleMonth), cells };
}

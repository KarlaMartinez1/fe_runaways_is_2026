"use client";

import { useMemo, useState } from "react";
import { CalendarView } from "@/components/ui/calendar-view";
import { availabilityMessages } from "@/lib/messages/properties";
import { buildAvailabilityCalendarModel } from "@/lib/calendar/availability-calendar";
import { shiftMonthKey, toMonthKey } from "@/lib/utils/dates";

type AvailabilityCalendarProps = {
  from: string;
  to: string;
  selectionLabel?: string;
  occupiedDates: string[];
  selectedStart?: string | null;
  selectedEnd?: string | null;
  onSelectDate?: (iso: string) => void;
};

export function AvailabilityCalendar({
  from,
  to,
  occupiedDates,
  selectedStart = null,
  selectedEnd = null,
  onSelectDate,
  selectionLabel = "Tu reserva",
}: AvailabilityCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => toMonthKey(from));
  const occupiedDateSet = useMemo(() => new Set(occupiedDates), [occupiedDates]);
  const { monthTitle, cells } = buildAvailabilityCalendarModel({
    visibleMonth,
    from,
    to,
    occupiedDates: occupiedDateSet,
    selectedStart,
    selectedEnd,
  });

  const canGoPrevious = visibleMonth > toMonthKey(from);
  const canGoNext = visibleMonth < toMonthKey(to);

  return (
    <CalendarView
      monthTitle={monthTitle}
      weekdays={availabilityMessages.weekdays}
      calendarLabel={availabilityMessages.calendarLabel}
      previousMonthLabel={availabilityMessages.previousMonth}
      nextMonthLabel={availabilityMessages.nextMonth}
      canGoPrevious={canGoPrevious}
      canGoNext={canGoNext}
      cells={cells}
      selectionLabel={selectionLabel}
      onPreviousMonth={() => setVisibleMonth((month) => shiftMonthKey(month, -1))}
      onNextMonth={() => setVisibleMonth((month) => shiftMonthKey(month, 1))}
      onSelectDate={onSelectDate}
    />
  );
}

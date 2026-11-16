"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AvailabilityCalendar } from "@/components/availability/availability-calendar";
import { Button } from "@/components/ui";
import { formatShortDate, formatShortRange } from "@/lib/bookings/format";
import type { PropertyAvailabilityState } from "@/lib/api/types";
import { bookingMessages } from "@/lib/messages/bookings";
import { availabilityMessages, detailMessages } from "@/lib/messages/properties";

type AvailabilitySectionProps = {
  state: PropertyAvailabilityState;
  selectedStart?: string | null;
  selectedEnd?: string | null;
  onSelectDate?: (iso: string) => void;
};

export function AvailabilitySection({
  state,
  selectedStart = null,
  selectedEnd = null,
  onSelectDate,
}: AvailabilitySectionProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (state.status === "hidden") {
    return null;
  }

  if (state.status === "unavailable") {
    return (
      <p role="alert" className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
        {detailMessages.notAvailable}
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
        <p role="alert">{availabilityMessages.loadError}</p>
        <Button variant="outline" size="sm" onClick={() => router.refresh()} className="self-start">
          {availabilityMessages.retry}
        </Button>
      </div>
    );
  }

  const triggerText =
    selectedStart && selectedEnd
      ? formatShortRange(selectedStart, selectedEnd)
      : selectedStart
        ? bookingMessages.chooseEnd(formatShortDate(selectedStart))
        : bookingMessages.selectDates;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-900">{availabilityMessages.label}</span>

      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="availability-calendar"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-11 items-center gap-2.5 rounded-lg border border-zinc-300 px-3 text-left text-sm text-zinc-800 transition-colors hover:border-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        <span>{triggerText}</span>
      </button>

      {isOpen && (
        <div id="availability-calendar">
          <AvailabilityCalendar
            from={state.from}
            to={state.to}
            occupiedDates={state.occupiedDates}
            selectedStart={selectedStart}
            selectedEnd={selectedEnd}
            onSelectDate={onSelectDate}
          />
        </div>
      )}
    </div>
  );
}
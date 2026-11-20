"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBookingAction } from "@/app/actions/bookings";

import { startConversation } from "@/app/actions/messages";
import { AvailabilitySection } from "@/components/availability/availability-section";
import { Button, Card } from "@/components/ui";
import type { PropertyAvailabilityState } from "@/lib/api/types";
import { bookingMessages } from "@/lib/messages/bookings";
import { bookingBoxMessages, formatPrice, propertyMessages } from "@/lib/messages/properties";
import { calculateSubtotal, countBookingDays, rangeOverlapsOccupied, validateBookingRange } from "@/lib/bookings/rules";

type BookingBoxProps = {
  propertyId: string;
  pricePerDay: string;
  securityDeposit: string;
  availability: PropertyAvailabilityState;
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-zinc-700">{label}</span>
      <span className="font-semibold text-zinc-900">{value}</span>
    </div>
  );
}

export function BookingBox({
  propertyId,
  pricePerDay,
  securityDeposit,
  availability,
}: BookingBoxProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const hasDeposit = Number(securityDeposit) > 0;
  const available = availability.status === "ready";
  const occupiedDates = available ? availability.occupiedDates : [];
  const days = startDate && endDate ? countBookingDays(startDate, endDate) : 0;
  const selectDate = (date: string) => {
    setError(null);
    if (!startDate || endDate || date <= startDate) {
      setStartDate(date);
      setEndDate(null);
    } else setEndDate(date);
  };
  const submitBooking = () => {
    if (!startDate || !endDate) return;
    const rangeError = validateBookingRange(startDate, endDate);
    if (rangeError) { setError(rangeError); return; }
    if (rangeOverlapsOccupied(startDate, endDate, occupiedDates)) {
      setError(bookingMessages.occupiedRange);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createBookingAction({ propertyId, startDate, endDate });
      if (result.ok) { router.push("/bookings/mine?created=1"); return; }
      setError(result.message);
      if (result.sessionExpired) router.push("/login");
      if (result.conflict) router.refresh();
    });
  };

  return (
    <Card padding="md" className="flex flex-col gap-4">
      <p className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-zinc-900">{formatPrice(pricePerDay)}</span>
        <span className="text-sm text-zinc-500">{propertyMessages.perDay}</span>
      </p>

      <AvailabilitySection state={availability} selectedStart={startDate} selectedEnd={endDate} onSelectDate={selectDate} />

      {available && (
        <div className="flex flex-col gap-2.5 rounded-lg bg-zinc-50 p-3.5">
          <SummaryRow label={bookingMessages.days} value={days ? String(days) : "—"} />
          <SummaryRow label={bookingMessages.subtotal} value={days ? formatPrice(calculateSubtotal(pricePerDay, days)) : "—"} />
          <SummaryRow
            label={bookingMessages.deposit}
            value={hasDeposit ? formatPrice(securityDeposit) : bookingBoxMessages.noDeposit}
          />
        </div>
      )}

      {available && (
        <Button fullWidth size="lg" disabled={!startDate || !endDate || isPending} onClick={submitBooking}>
          {isPending ? bookingMessages.confirming : bookingMessages.confirm}
        </Button>
      )}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

           {/* H15: abre el hilo de conversación de este bien con su arrendador. */}
      <form action={startConversation.bind(null, propertyId)}>
        <Button type="submit" variant="outline" fullWidth size="lg">
          {bookingBoxMessages.askOwner}
        </Button>
      </form>
    </Card>
  );
}

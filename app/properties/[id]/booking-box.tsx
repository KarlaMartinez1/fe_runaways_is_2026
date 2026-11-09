"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createBookingAction } from "@/app/actions/bookings";
import { AvailabilitySection } from "@/components/availability/availability-section";
import { Button, Card } from "@/components/ui";
import type { PropertyAvailabilityState } from "@/lib/api/types";
import {
  calculateSubtotal,
  countBookingDays,
  MAX_BOOKING_DAYS,
  rangeOverlapsOccupied,
  validateBookingRange,
} from "@/lib/bookings/rules";
import { bookingMessages } from "@/lib/messages/bookings";
import { bookingBoxMessages, formatPrice, propertyMessages } from "@/lib/messages/properties";

type BookingBoxProps = {
  propertyId: string;
  pricePerDay: string;
  securityDeposit: string;
  isVerified: boolean;
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
  isVerified,
  availability,
}: BookingBoxProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationError, setShowVerificationError] = useState(false);

  const hasDeposit = Number(securityDeposit) > 0;
  const available = availability.status === "ready" ? availability : null;
  const occupiedDates = available?.occupiedDates ?? [];

  const days = startDate && endDate ? countBookingDays(startDate, endDate) : null;
  const subtotal = days ? calculateSubtotal(pricePerDay, days) : null;

  const resetSelection = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleSelectDate = (iso: string) => {
    setError(null);
    setShowVerificationError(false);

    // Primer clic, o clic anterior al inicio: empieza una nueva selección.
    if (!startDate || endDate || iso < startDate) {
      setStartDate(iso);
      setEndDate(null);
      return;
    }

    if (rangeOverlapsOccupied(startDate, iso, occupiedDates)) {
      setError(bookingMessages.occupiedRange);
      setStartDate(iso);
      setEndDate(null);
      return;
    }

    if (countBookingDays(startDate, iso) > MAX_BOOKING_DAYS) {
      setError(bookingMessages.tooLong);
      setStartDate(iso);
      setEndDate(null);
      return;
    }

    setEndDate(iso);
  };

  const handleConfirm = () => {
    if (isPending) return;

    if (!isVerified) {
      setShowVerificationError(true);
      return;
    }

    const validation = validateBookingRange(startDate, endDate);
    if (validation || !startDate || !endDate) {
      setError(validation);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await createBookingAction({ propertyId, startDate, endDate });

      if (result.ok) {
        router.push("/bookings/mine?created=1");
        return;
      }

      if (result.sessionExpired) {
        router.push("/login");
        return;
      }

      setError(result.message);
      if (result.conflict) {
        resetSelection();
      }
      // Vuelve a cargar la disponibilidad para reflejar las fechas ya ocupadas.
      router.refresh();
    });
  };

  return (
    <Card padding="md" className="flex flex-col gap-4">
      <p className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-zinc-900">{formatPrice(pricePerDay)}</span>
        <span className="text-sm text-zinc-500">{propertyMessages.perDay}</span>
      </p>

      <AvailabilitySection
        state={availability}
        selectedStart={startDate}
        selectedEnd={endDate}
        onSelectDate={available ? handleSelectDate : undefined}
      />

      {available && (
        <div className="flex flex-col gap-2.5 rounded-lg bg-zinc-50 p-3.5">
          <SummaryRow label={bookingMessages.days} value={days ? String(days) : "—"} />
          <SummaryRow label={bookingMessages.subtotal} value={subtotal ? formatPrice(subtotal) : "—"} />
          <SummaryRow
            label={bookingMessages.deposit}
            value={hasDeposit ? formatPrice(securityDeposit) : bookingBoxMessages.noDeposit}
          />
        </div>
      )}

      <p className="rounded-lg bg-[#EEF0E2] px-3 py-2 text-sm text-zinc-800">
        {bookingBoxMessages.requiresVerification}
      </p>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      {available && (
        <Button fullWidth size="lg" isLoading={isPending} onClick={handleConfirm}>
          {isPending ? bookingMessages.confirming : bookingMessages.confirm}
        </Button>
      )}

      {showVerificationError && (
        <p role="alert" className="text-sm text-red-700">
          {bookingBoxMessages.verificationRequired}{" "}
          <Link href="/profile/verification" className="font-semibold underline">
            {bookingBoxMessages.verifyAccount}
          </Link>
        </p>
      )}

      <Button asChild variant="outline" fullWidth size="lg">
        <Link href="/messages">{bookingBoxMessages.askOwner}</Link>
      </Button>
    </Card>
  );
}
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createBookingAction } from "@/app/actions/bookings";
import { startConversation } from "@/app/actions/messages";
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

      // H21: el servidor rechazó la reserva por cuenta sin verificar.
      if (result.verificationRequired) {
        setShowVerificationError(true);
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

      <p className="flex items-center gap-2 rounded-lg border border-[#FDE68A] bg-[#FEF9E7] px-3 py-2 text-sm font-medium text-[#92400E]">
        <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#D97706]" />
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
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm"
        >
          <span aria-hidden="true" className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-600" />
          <div className="flex flex-col gap-1">
            <p className="font-medium text-red-700">{bookingBoxMessages.verificationRequired}</p>
            <Link href="/profile/verification" className="font-semibold text-[#1d4ed8] hover:underline">
              {bookingBoxMessages.verifyAccount} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      )}

           {/* H15: abre el hilo de conversación de este bien con su arrendador. */}
      <form action={startConversation.bind(null, propertyId)}>
        <Button type="submit" variant="outline" fullWidth size="lg">
          {bookingBoxMessages.askOwner}
        </Button>
      </form>
    </Card>
  );
}
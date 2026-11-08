"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { bookingBoxMessages, formatPrice, propertyMessages } from "@/lib/messages/properties";

type BookingBoxProps = {
  pricePerDay: string;
  securityDeposit: string;
  isVerified: boolean;
};

export function BookingBox({ pricePerDay, securityDeposit, isVerified }: BookingBoxProps) {
  const [showVerificationError, setShowVerificationError] = useState(false);
  const hasDeposit = Number(securityDeposit) > 0;

  const handleReserve = () => {
    if (!isVerified) {
      setShowVerificationError(true);
      return;
    }
    document.getElementById("reservar")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Card padding="md" className="flex flex-col gap-4">
      <p className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-zinc-900">{formatPrice(pricePerDay)}</span>
        <span className="text-sm text-zinc-500">{propertyMessages.perDay}</span>
      </p>

      <div className="flex justify-between text-sm">
        <span className="text-zinc-500">{bookingBoxMessages.depositLabel}</span>
        <span className="font-semibold text-zinc-900">
          {hasDeposit ? formatPrice(securityDeposit) : bookingBoxMessages.noDeposit}
        </span>
      </div>

      <p className="rounded-lg bg-[#EEF0E2] px-3 py-2 text-sm text-zinc-800">
        {bookingBoxMessages.requiresVerification}
      </p>

      <Button fullWidth size="lg" onClick={handleReserve}>
        {bookingBoxMessages.reserve}
      </Button>

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
"use client";

import { startConversation } from "@/app/actions/messages";
import { AvailabilitySection } from "@/components/availability/availability-section";
import { Button, Card } from "@/components/ui";
import type { PropertyAvailabilityState } from "@/lib/api/types";
import { bookingMessages } from "@/lib/messages/bookings";
import { bookingBoxMessages, formatPrice, propertyMessages } from "@/lib/messages/properties";

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
  const hasDeposit = Number(securityDeposit) > 0;
  const available = availability.status === "ready";

  return (
    <Card padding="md" className="flex flex-col gap-4">
      <p className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-zinc-900">{formatPrice(pricePerDay)}</span>
        <span className="text-sm text-zinc-500">{propertyMessages.perDay}</span>
      </p>

      <AvailabilitySection state={availability} />

      {available && (
        <div className="flex flex-col gap-2.5 rounded-lg bg-zinc-50 p-3.5">
          <SummaryRow label={bookingMessages.days} value="—" />
          <SummaryRow label={bookingMessages.subtotal} value="—" />
          <SummaryRow
            label={bookingMessages.deposit}
            value={hasDeposit ? formatPrice(securityDeposit) : bookingBoxMessages.noDeposit}
          />
        </div>
      )}

      {available && (
        <Button fullWidth size="lg" disabled>
          {bookingMessages.confirm}
        </Button>
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

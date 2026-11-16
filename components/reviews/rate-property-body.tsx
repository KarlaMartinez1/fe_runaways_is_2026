import Link from "next/link";
import { Card } from "@/components/ui";
import type { ReservationForReview } from "@/lib/api/types";
import { reviewMessages } from "@/lib/messages/reviews";
import { blockReasonMessage, getRatingBlockReason } from "@/lib/reviews/rules";
import { RatePropertyForm } from "./rate-property-form";
import { ReservationSummaryCard } from "./reservation-summary-card";

type RatePropertyBodyProps = {
  reservation: ReservationForReview;
};

export function RatePropertyBody({ reservation }: RatePropertyBodyProps) {
  const blockReason = getRatingBlockReason(reservation);

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[5fr_6fr]">
      <ReservationSummaryCard reservation={reservation} />

      {blockReason ? (
        <Card padding="md" className="flex flex-col gap-4">
          <p role="alert" className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {blockReasonMessage[blockReason]}
          </p>
          <Link
            href="/bookings/mine"
            className="inline-flex h-11 w-fit items-center justify-center rounded-xl border border-[#cfd3da] px-5 text-sm font-semibold text-[#1f2330] hover:bg-gray-50"
          >
            {reviewMessages.backToBookings}
          </Link>
        </Card>
      ) : (
        <RatePropertyForm reservationId={reservation.id} />
      )}
    </div>
  );
}
import { Card } from "@/components/ui";
import type { ReservationForReview } from "@/lib/api/types";
import { formatShortDate } from "@/lib/bookings/format";
import { formatPrice } from "@/lib/messages/properties";
import { reviewMessages } from "@/lib/messages/reviews";

type ReservationSummaryCardProps = {
  reservation: ReservationForReview;
};

// Suma en centavos para evitar errores de punto flotante.
function addMoney(a: string, b: string) {
  return ((Math.round(Number(a) * 100) + Math.round(Number(b) * 100)) / 100).toFixed(2);
}

export function ReservationSummaryCard({ reservation }: ReservationSummaryCardProps) {
  const total = addMoney(reservation.subtotal, reservation.securityDeposit);

  return (
    <Card padding="md" className="flex flex-col gap-4 lg:sticky lg:top-8">
      <div className="flex h-[200px] items-center justify-center overflow-hidden rounded-xl bg-[#dde3f5] text-sm text-[#5b6270]">
        {reservation.propertyImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={reservation.propertyImage}
            alt={reservation.propertyTitle}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{reviewMessages.coverPlaceholder}</span>
        )}
      </div>

      <h2 className="text-lg font-semibold text-[#1f2330]">{reservation.propertyTitle}</h2>

      <dl className="flex flex-col text-sm text-[#1f2330]">
        <div className="flex items-center justify-between py-1.5">
          <dt>{reviewMessages.checkIn}</dt>
          <dd className="font-semibold">{formatShortDate(reservation.startDate)}</dd>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <dt>{reviewMessages.checkOut}</dt>
          <dd className="font-semibold">{formatShortDate(reservation.endDate)}</dd>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-[#e5e7eb] pt-3.5 text-lg font-bold">
          <dt>{reviewMessages.totalFinal}</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
    </Card>
  );
}
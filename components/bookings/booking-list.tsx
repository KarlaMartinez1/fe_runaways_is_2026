import Link from "next/link";
import { Badge } from "@/components/ui";
import type { BadgeVariant } from "@/components/ui/badge";
import { formatDeadline, formatShortRange } from "@/lib/bookings/format";
import type { BookingListItem, BookingStatus } from "@/lib/api/types";
import { bookingMessages } from "@/lib/messages/bookings";
import { formatPrice } from "@/lib/messages/properties";
import { reviewMessages } from "@/lib/messages/reviews";
import { getRatingBlockReason } from "@/lib/reviews/rules";

type BookingListProps = {
  items: BookingListItem[];
  variant: "mine" | "lessor";
  emptyMessage: string;
};

const statusVariant: Record<BookingStatus, BadgeVariant> = {
  PENDIENTE: "warning",
  PAGADA: "success",
  FINALIZADA: "info",
  CANCELADA: "danger",
};

// Misma regla que la pantalla de calificaciÃ³n: finalizada, sin reseÃ±a y dentro de 14 dÃ­as.
function canRate(booking: BookingListItem) {
  return (
    getRatingBlockReason({
      status: booking.status,
      finalizedAt: booking.finalizedAt ?? null,
      ratedByMe: booking.ratedByMe ?? false,
    }) === null
  );
}

export function BookingList({ items, variant, emptyMessage }: BookingListProps) {
  if (items.length === 0) {
    return <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-600">{emptyMessage}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((booking) => (
        <li key={booking.id} className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-zinc-900">{booking.propertyTitle}</p>
            <p className="text-sm text-zinc-600">
              {formatShortRange(booking.startDate, booking.endDate)} · {booking.days} {booking.days === 1 ? "día" : "días"} · {formatPrice(booking.subtotal)}
            </p>
            {variant === "lessor" && booking.lesseeName && (
              <p className="text-sm text-zinc-600">
                {bookingMessages.lessor.lessee}: {booking.lesseeName}
              </p>
            )}
            {booking.status === "PENDIENTE" && booking.expiresAt && (
              <p className="text-sm font-medium text-amber-700">
                {bookingMessages.mine.payBefore} {formatDeadline(booking.expiresAt)}
              </p>
            )}
            {booking.status === "CANCELADA" && booking.cancelReason === "VENCIDA" && (
              <p className="text-sm text-zinc-500">{bookingMessages.cancelReasonVencida}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={statusVariant[booking.status]}>{booking.status}</Badge>
            {variant === "mine" && booking.status === "PENDIENTE" && (
              <Link
                href={`/bookings/${booking.id}/payment`}
                className="rounded-lg bg-[#1f4fb8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e40af]"
              >
                {bookingMessages.mine.pay}
              </Link>
            )}
            {variant === "mine" && canRate(booking) && (
              <Link
                href={`/reservations/${booking.id}/rate-property`}
                className="rounded-lg border border-[#cfd3da] px-4 py-2 text-sm font-semibold text-[#1f2330] hover:bg-gray-50"
              >
                {reviewMessages.rateButton}
              </Link>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

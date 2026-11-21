import Link from "next/link";
import { Badge } from "@/components/ui";
import type { BadgeVariant } from "@/components/ui/badge";
import { formatDeadline, formatShortRange } from "@/lib/bookings/format";
import type { BookingListItem, BookingStatus } from "@/lib/api/types";
import { bookingMessages } from "@/lib/messages/bookings";
import { formatPrice } from "@/lib/messages/properties";
import { reviewMessages } from "@/lib/messages/reviews";
import { blockReasonMessage, getRatingBlockReason } from "@/lib/reviews/rules";

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

// Uses the review flag from the API and the available booking date.
function getBookingRatingBlockReason(booking: BookingListItem) {
  return getRatingBlockReason({
    status: booking.status,
    finalizedAt: booking.finalizedAt ?? null,
    endDate: booking.endDate,
    ratedByMe: booking.hasPropertyReview ?? false,
  });
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
            {booking.status === "CANCELADA" && (
              <p className="text-sm text-zinc-500">{bookingMessages.cancelReasonVencida}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={statusVariant[booking.status]}>{booking.status}</Badge>
            {variant === "mine" && booking.status === "PENDIENTE" && (
              <Link
                href={`/payment?reservationId=${encodeURIComponent(booking.id)}`}
                className="inline-flex h-7 items-center rounded-full bg-violet-100 px-2.5 text-xs font-semibold text-violet-800 transition-colors hover:bg-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
              >
                {bookingMessages.mine.pay}
              </Link>
            )}
            {variant === "lessor" && (
              <Link
                href={`/deposit?reservationId=${encodeURIComponent(booking.id)}`}
                className={`inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold transition-colors ${
                  booking.status === "FINALIZADA"
                    ? "bg-zinc-900 text-white hover:bg-zinc-800"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                {booking.status === "FINALIZADA" ? "Gestionar depósito" : "Ver depósito"}
              </Link>
            )}
            {variant === "mine" && booking.status === "FINALIZADA" && (() => {
              const blockReason = getBookingRatingBlockReason(booking);
              return blockReason ? (
                <span className="group relative inline-flex" title={blockReasonMessage[blockReason]}>
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    aria-label={`${reviewMessages.rateButton}: ${blockReasonMessage[blockReason]}`}
                    className="cursor-not-allowed rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-500"
                  >
                    {reviewMessages.rateButton}
                  </button>
                  <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-64 -translate-x-1/2 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    {blockReasonMessage[blockReason]}
                  </span>
                </span>
              ) : (
                <Link
                  href={`/reservations/${booking.id}/rate-property`}
                  className="rounded-lg border border-[#cfd3da] px-4 py-2 text-sm font-semibold text-[#1f2330] hover:bg-gray-50"
                >
                  {reviewMessages.rateButton}
                </Link>
              );
            })()}
          </div>
        </li>
      ))}
    </ul>
  );
}

import Link from "next/link";
import { Badge } from "@/components/ui";
import type { BadgeVariant } from "@/components/ui/badge";
import { formatDeadline, formatShortRange } from "@/lib/bookings/format";
import type { BookingListItem, BookingStatus } from "@/lib/api/types";
import { bookingMessages } from "@/lib/messages/bookings";
import { formatPrice } from "@/lib/messages/properties";

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

          <div className="flex items-center gap-3">
            <Badge variant={statusVariant[booking.status]}>{booking.status}</Badge>
            {variant === "mine" && booking.status === "PENDIENTE" && (
              <Link
                href={`/bookings/${booking.id}/payment`}
                className="rounded-lg bg-[#1f4fb8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e40af]"
              >
                {bookingMessages.mine.pay}
              </Link>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
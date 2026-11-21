import { render, screen } from "@testing-library/react";
import { BookingList } from "./booking-list";
import type { BookingListItem } from "@/lib/api/types";
import { bookingMessages } from "@/lib/messages/bookings";
import { formatDeadline } from "@/lib/bookings/format";

const pendingBooking: BookingListItem = {
  id: "booking-1",
  propertyId: "property-1",
  propertyTitle: "Proyector Epson",
  startDate: "2026-11-25",
  endDate: "2026-11-27",
  days: 3,
  subtotal: "76.50",
  securityDeposit: "30.00",
  status: "PENDIENTE",
  expiresAt: "2026-11-21T10:30:00Z",
  cancelReason: null,
  deliveredAt: null,
  returnedAt: null,
};

describe("BookingList", () => {
  it("muestra la reserva pendiente y su hora límite de pago en Mis reservas", () => {
    render(
      <BookingList
        items={[pendingBooking]}
        variant="mine"
        emptyMessage={bookingMessages.mine.empty}
      />
    );

    expect(screen.getByText("Proyector Epson")).toBeInTheDocument();
    expect(screen.getByText("PENDIENTE")).toBeInTheDocument();
    expect(
      screen.getByText(`${bookingMessages.mine.payBefore} ${formatDeadline(pendingBooking.expiresAt!)}`)
    ).toBeInTheDocument();
  });
});

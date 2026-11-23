import { render, screen, within } from "@testing-library/react";
import MyBookingsPage from "./page";
import { bookingMessages } from "@/lib/messages/bookings";
import { bookingRepository } from "@/lib/repositories";
import { formatDeadline } from "@/lib/bookings/format";
import type { BookingListItem } from "@/lib/api/types";

jest.mock("@/lib/repositories", () => ({
  bookingRepository: { listMine: jest.fn() },
}));
jest.mock("@/components/layout/navbar", () => ({ Navbar: () => null }));

const pendingBooking: BookingListItem = {
  id: "booking-h10",
  propertyId: "property-1",
  propertyTitle: "Proyector",
  startDate: "2026-11-25",
  endDate: "2026-11-27",
  days: 3,
  subtotal: "75.00",
  status: "PENDIENTE",
  expiresAt: "2026-11-23T12:00:00.000Z",
  cancelReason: null,
  deliveredAt: null,
  returnedAt: null,
};

describe("H10 AC3: resultado exitoso en Mis reservas", () => {
  it("muestra el mensaje de éxito, la reserva PENDIENTE y su hora límite de pago", async () => {
    (bookingRepository.listMine as jest.Mock).mockResolvedValue({
      data: [pendingBooking],
      total: 1,
      page: 1,
      totalPages: 1,
    });

    const page = await MyBookingsPage({
      searchParams: Promise.resolve({ created: "1" }),
    });
    render(page);

    expect(screen.getByRole("status")).toHaveTextContent(bookingMessages.created);
    expect(within(screen.getByRole("list")).getByText("PENDIENTE")).toBeInTheDocument();
    expect(
      screen.getByText(`${bookingMessages.mine.payBefore} ${formatDeadline(pendingBooking.expiresAt!)}`),
    ).toBeInTheDocument();
  });
});

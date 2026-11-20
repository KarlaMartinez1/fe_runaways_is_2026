import { render, screen } from "@testing-library/react";
import { ReservationSummary } from "./reservation-summary";
import { paymentMessages } from "@/lib/messages/payment";
import type { ReservationDetail } from "@/types";

const baseReservation: ReservationDetail = {
  id: "res-01",
  itemTitle: "Cámara Sony Alpha A7 IV",
  startDate: "10/11/2026",
  endDate: "12/11/2026",
  daysCount: 3,
  subtotal: 150,
  securityDeposit: 50,
  total: 200,
  dueDate: "2026-11-09T23:59:00Z",
  isReadOnly: false,
};

describe("ReservationSummary", () => {
  it("retorna null si no se proporciona reserva", () => {
    const { container } = render(<ReservationSummary />);
    expect(container.firstChild).toBeNull();
  });

  it("muestra los detalles completos de la reserva con pluralización correcta", () => {
    render(<ReservationSummary reservation={baseReservation} className="custom-card" />);

    expect(
      screen.getByRole("heading", { name: paymentMessages.summaryTitle })
    ).toBeInTheDocument();
    expect(screen.getByText("Cámara Sony Alpha A7 IV")).toBeInTheDocument();
    expect(screen.getByText("Del 10/11/2026 al 12/11/2026")).toBeInTheDocument();
    expect(screen.getByText("3 días")).toBeInTheDocument();
    expect(screen.getByText("$150.00")).toBeInTheDocument();
    expect(screen.getByText("$50.00")).toBeInTheDocument();
    expect(screen.getByText("$200.00")).toBeInTheDocument();
    expect(screen.getByText(paymentMessages.formulaNote)).toBeInTheDocument();
    expect(
      screen.getByText(paymentMessages.dueNotice(baseReservation.dueDate))
    ).toBeInTheDocument();
    expect(screen.queryByText(paymentMessages.readOnlyBadge)).not.toBeInTheDocument();
  });

  it("muestra badge de solo lectura, singular para 1 día y soporta fechas Date", () => {
    const start = new Date("2026-12-01T12:00:00Z");
    const end = new Date("2026-12-01T12:00:00Z");
    const expectedRange = paymentMessages.formatRentalDateRange(start, end);

    render(
      <ReservationSummary
        reservation={{
          ...baseReservation,
          startDate: start,
          endDate: end,
          daysCount: 1,
          isReadOnly: true,
          dueDate: "",
        }}
      />
    );

    expect(screen.getByText(paymentMessages.readOnlyBadge)).toBeInTheDocument();
    expect(screen.getByText("1 día")).toBeInTheDocument();
    expect(screen.getByText(expectedRange)).toBeInTheDocument();
    expect(screen.queryByText(/Pagar antes de:/)).not.toBeInTheDocument();
  });
});

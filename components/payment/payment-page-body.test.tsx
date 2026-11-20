import { render, screen } from "@testing-library/react";
import { PaymentPageBody } from "./payment-page-body";
import { paymentFormMessages, paymentMessages } from "@/lib/messages/payment";
import type { ReservationDetail } from "@/types";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

const sampleReservation: ReservationDetail = {
  id: "res-42",
  itemTitle: "Estudio Fotográfico Central",
  startDate: "20/11/2026",
  endDate: "22/11/2026",
  daysCount: 3,
  subtotal: 120,
  securityDeposit: 40,
  total: 160,
  dueDate: "2026-11-19T18:00:00Z",
};

describe("PaymentPageBody", () => {
  it("renderiza el encabezado, el resumen de reserva y el formulario de pago", () => {
    render(<PaymentPageBody reservation={sampleReservation} />);

    expect(
      screen.getByRole("heading", { level: 1, name: paymentMessages.pageTitle })
    ).toBeInTheDocument();
    expect(screen.getByText(paymentMessages.pageSubtitle)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: paymentMessages.summaryTitle })
    ).toBeInTheDocument();
    expect(screen.getByText("Estudio Fotográfico Central")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: paymentFormMessages.formTitle })
    ).toBeInTheDocument();
  });

  it("omite el resumen cuando no hay reserva y muestra el formulario usando bookingId", () => {
    render(<PaymentPageBody bookingId="book-fallback" className="extra-wrapper" />);

    expect(
      screen.queryByRole("heading", { name: paymentMessages.summaryTitle })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: paymentFormMessages.formTitle })
    ).toBeInTheDocument();
  });
});

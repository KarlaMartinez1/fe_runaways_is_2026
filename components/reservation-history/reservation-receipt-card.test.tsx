import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReservationReceiptCard } from "./reservation-receipt-card";
import { receiptMessages } from "@/lib/messages/receipt";
import type { PaymentReceiptDetail } from "@/types";

const baseReceipt: PaymentReceiptDetail = {
  id: "rec-01",
  status: "Pagada",
  itemTitle: "Taladro Percutor Bosch",
  rentalDateRange: "Del 10/11/2026 al 12/11/2026",
  daysCount: 3,
  transactionNumber: "TRX-9001",
  paymentDateTime: "09/11/2026 02:30 PM",
  rentalSubtotal: 45,
  securityDeposit: 20,
  totalPaid: 65,
  paymentMethod: "Visa terminada en 4242",
};

describe("ReservationReceiptCard", () => {
  it("renderiza los datos del comprobante y ejecuta onBackToReservations", async () => {
    const user = userEvent.setup();
    const onBack = jest.fn();

    render(
      <ReservationReceiptCard
        receipt={baseReceipt}
        onBackToReservations={onBack}
        className="custom-receipt"
      />
    );

    expect(
      screen.getByRole("article", { name: receiptMessages.receiptCardTitle })
    ).toBeInTheDocument();
    expect(screen.getByText("Pagada")).toBeInTheDocument();
    expect(screen.getByText("Taladro Percutor Bosch")).toBeInTheDocument();
    expect(screen.getByText("Del 10/11/2026 al 12/11/2026")).toBeInTheDocument();
    expect(screen.getByText("3 días")).toBeInTheDocument();
    expect(screen.getByText("TRX-9001")).toBeInTheDocument();
    expect(screen.getByText("09/11/2026 02:30 PM")).toBeInTheDocument();
    expect(screen.getByText("$45.00")).toBeInTheDocument();
    expect(screen.getByText("$20.00")).toBeInTheDocument();
    expect(screen.getByText("$65.00")).toBeInTheDocument();
    expect(screen.getByText("Visa terminada en 4242")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: receiptMessages.backToReservations })
    );
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it.each<PaymentReceiptDetail["status"]>([
    "Pagada",
    "Devuelta",
    "Retenida",
    "Pendiente",
  ])("muestra el badge y singular para el estado %s", (status) => {
    render(
      <ReservationReceiptCard
        receipt={{
          ...baseReceipt,
          status,
          daysCount: 1,
        }}
      />
    );

    expect(screen.getByText(status)).toBeInTheDocument();
    expect(screen.getByText("1 día")).toBeInTheDocument();
  });
});

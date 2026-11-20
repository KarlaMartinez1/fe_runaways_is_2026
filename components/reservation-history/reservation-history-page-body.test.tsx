import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReservationHistoryPageBody } from "./reservation-history-page-body";
import { receiptMessages } from "@/lib/messages/receipt";
import type { PaymentReceiptDetail, ReservationMovement } from "@/types";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const movements: ReservationMovement[] = [
  {
    id: "mov-1",
    date: "10/11/2026",
    type: "COBRO",
    amount: 200,
    reason: "Cobro inicial",
    receiptId: "rec-1",
  },
  {
    id: "mov-2",
    date: "15/11/2026",
    type: "DEVOLUCIÓN",
    amount: 50,
    reason: "Devolución total",
    receiptId: "rec-2",
  },
  {
    id: "mov-3",
    date: "16/11/2026",
    type: "RETENCIÓN",
    amount: 30,
    reason: "Reparación menor",
  },
];

const initialReceipt: PaymentReceiptDetail = {
  id: "rec-1",
  status: "Pagada",
  itemTitle: "Cámara Canon EOS R6",
  rentalDateRange: "Del 10/11/2026 al 14/11/2026",
  daysCount: 5,
  transactionNumber: "TRX-100",
  paymentDateTime: "10/11/2026 09:00 AM",
  rentalSubtotal: 150,
  securityDeposit: 50,
  totalPaid: 200,
  paymentMethod: "Visa •••• 4242",
};

const mappedReceipt: PaymentReceiptDetail = {
  id: "rec-2",
  status: "Devuelta",
  itemTitle: "Cámara Canon EOS R6",
  rentalDateRange: "Del 10/11/2026 al 14/11/2026",
  daysCount: 5,
  transactionNumber: "TRX-200",
  paymentDateTime: "15/11/2026 05:00 PM",
  rentalSubtotal: 0,
  securityDeposit: 50,
  totalPaid: 50,
  paymentMethod: "Visa •••• 4242",
};

describe("ReservationHistoryPageBody", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("muestra movimientos, el recibo inicial y permite cambiar de recibo o volver al catálogo", async () => {
    const user = userEvent.setup();

    render(
      <ReservationHistoryPageBody
        initialMovements={movements}
        initialReceipt={initialReceipt}
        receiptsMap={{ "rec-1": initialReceipt, "rec-2": mappedReceipt }}
      />
    );

    expect(
      screen.getByRole("heading", { level: 1, name: receiptMessages.pageTitle })
    ).toBeInTheDocument();
    expect(screen.getByText(receiptMessages.pageSubtitle)).toBeInTheDocument();
    expect(screen.getByText("TRX-100")).toBeInTheDocument();

    const table = screen.getByRole("table");
    await user.click(
      within(table).getByRole("button", {
        name: receiptMessages.viewReceiptAriaLabel("Devolución total"),
      })
    );
    expect(screen.getByText("TRX-200")).toBeInTheDocument();
    expect(screen.getByText("Devuelta")).toBeInTheDocument();

    // Seleccionar movimiento sin entrada en receiptsMap construye un recibo de respaldo
    await user.click(
      within(table).getByRole("button", {
        name: receiptMessages.viewReceiptAriaLabel("Reparación menor"),
      })
    );
    expect(screen.getByText("TRX-MOV-3")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: receiptMessages.backToReservations })
    );
    expect(mockPush).toHaveBeenCalledWith("/properties");
  });

  it("no renderiza tarjeta de recibo cuando initialReceipt no está definido", () => {
    render(<ReservationHistoryPageBody initialMovements={[]} />);

    expect(
      screen.queryByRole("article", { name: receiptMessages.receiptCardTitle })
    ).not.toBeInTheDocument();
    expect(screen.getAllByText(receiptMessages.emptyMovements)).toHaveLength(2);
  });
});

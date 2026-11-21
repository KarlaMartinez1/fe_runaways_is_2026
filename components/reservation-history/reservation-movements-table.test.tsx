import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReservationMovementsTable } from "./reservation-movements-table";
import { receiptMessages } from "@/lib/messages/receipt";
import type { ReservationMovement } from "@/types";

const sampleMovements: ReservationMovement[] = [
  {
    id: "mov-1",
    date: "10/11/2026",
    type: "COBRO",
    amount: 200,
    reason: "Pago de reserva",
    receiptId: "rec-1",
  },
  {
    id: "mov-2",
    date: "14/11/2026",
    type: "DEVOLUCIÓN",
    amount: 50,
    reason: "Devolución de depósito",
    receiptId: "rec-2",
  },
  {
    id: "mov-3",
    date: "15/11/2026",
    type: "RETENCIÓN",
    amount: 25,
    reason: "Cargo por limpieza",
    receiptId: "rec-3",
  },
];

describe("ReservationMovementsTable", () => {
  it("muestra estado vacío en móvil y en tabla de escritorio", () => {
    render(<ReservationMovementsTable movements={[]} />);

    const table = screen.getByRole("table");
    expect(
      within(table).getByText(receiptMessages.emptyMovements)
    ).toBeInTheDocument();
    expect(screen.getAllByText(receiptMessages.emptyMovements)).toHaveLength(2);
  });

  it("renderiza movimientos, marca el seleccionado e invoca onSelectReceipt", async () => {
    const user = userEvent.setup();
    const onSelectReceipt = jest.fn();

    render(
      <ReservationMovementsTable
        movements={sampleMovements}
        selectedReceiptId="rec-2"
        onSelectReceipt={onSelectReceipt}
      />
    );

    const table = screen.getByRole("table");
    expect(within(table).getByText("COBRO")).toBeInTheDocument();
    expect(within(table).getByText("DEVOLUCIÓN")).toBeInTheDocument();
    expect(within(table).getByText("RETENCIÓN")).toBeInTheDocument();
    expect(within(table).getByText("$200.00")).toBeInTheDocument();
    expect(within(table).getByText("Devolución de depósito")).toBeInTheDocument();

    const selectedDesktopButton = within(table).getByRole("button", {
      name: receiptMessages.viewReceiptAriaLabel("Devolución de depósito"),
    });
    expect(selectedDesktopButton).toHaveAttribute("aria-pressed", "true");

    const unselectedDesktopButton = within(table).getByRole("button", {
      name: receiptMessages.viewReceiptAriaLabel("Pago de reserva"),
    });
    expect(unselectedDesktopButton).toHaveAttribute("aria-pressed", "false");

    await user.click(unselectedDesktopButton);
    expect(onSelectReceipt).toHaveBeenCalledWith(sampleMovements[0]);

    const mobileCards = screen.getAllByRole("article");
    expect(mobileCards).toHaveLength(3);
    const mobileButton = within(mobileCards[2]).getByRole("button", {
      name: receiptMessages.viewReceiptAction,
    });
    await user.click(mobileButton);
    expect(onSelectReceipt).toHaveBeenCalledWith(sampleMovements[2]);
  });
});

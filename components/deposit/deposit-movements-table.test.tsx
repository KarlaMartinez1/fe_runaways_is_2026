import { render, screen, within } from "@testing-library/react";
import { DepositMovementsTable } from "./deposit-movements-table";
import { depositMessages } from "@/lib/messages/deposit";
import type { DepositMovement } from "@/types";

const sampleMovements: DepositMovement[] = [
  {
    id: "dm-1",
    date: "10/11/2026",
    type: "COBRO",
    amount: 50,
    reason: "Depósito en garantía",
    details: "Reserva #101",
  },
  {
    id: "dm-2",
    date: "15/11/2026",
    type: "RETENCIÓN",
    amount: 20,
    reason: "Limpieza adicional",
    details: "Retención parcial",
  },
  {
    id: "dm-3",
    date: "15/11/2026",
    type: "DEVOLUCIÓN",
    amount: 30,
    reason: "Devolución automática",
    details: "Cuenta de origen",
  },
];

describe("DepositMovementsTable", () => {
  it("muestra estado vacío en vista móvil y tabla de escritorio", () => {
    render(<DepositMovementsTable movements={[]} />);

    const table = screen.getByRole("table");
    expect(
      within(table).getByText(depositMessages.emptyMovements)
    ).toBeInTheDocument();
    expect(screen.getAllByText(depositMessages.emptyMovements)).toHaveLength(2);
  });

  it("renderiza movimientos en tabla y tarjetas móviles", () => {
    render(<DepositMovementsTable movements={sampleMovements} className="extra-box" />);

    const table = screen.getByRole("table");
    expect(within(table).getByText("COBRO")).toBeInTheDocument();
    expect(within(table).getByText("RETENCIÓN")).toBeInTheDocument();
    expect(within(table).getByText("DEVOLUCIÓN")).toBeInTheDocument();
    expect(within(table).getByText("$50.00")).toBeInTheDocument();
    expect(within(table).getByText("Limpieza adicional")).toBeInTheDocument();
    expect(within(table).getByText("Cuenta de origen")).toBeInTheDocument();

    const mobileCards = screen.getAllByRole("article");
    expect(mobileCards).toHaveLength(3);
    expect(within(mobileCards[0]).getByText("Depósito en garantía")).toBeInTheDocument();
    expect(within(mobileCards[1]).getByText("$20.00")).toBeInTheDocument();
  });
});

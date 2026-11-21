import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DepositPageBody } from "./deposit-page-body";
import { depositMessages } from "@/lib/messages/deposit";
import {
  refundDepositAction,
  retainDepositAction,
} from "@/app/actions/deposits";
import type { DepositInfo, DepositMovement } from "@/types";

jest.mock("@/app/actions/deposits", () => ({
  refundDepositAction: jest.fn(),
  retainDepositAction: jest.fn(),
}));

const mockedRefundDepositAction = refundDepositAction as jest.MockedFunction<
  typeof refundDepositAction
>;
const mockedRetainDepositAction = retainDepositAction as jest.MockedFunction<
  typeof retainDepositAction
>;

const baseDepositInfo: DepositInfo = {
  id: "dep-1",
  reservationId: "res-1",
  itemTitle: "Cámara Fujifilm X-T5",
  rentalPeriod: "01/11/2026 – 04/11/2026",
  depositAmount: 50,
  status: "Pendiente de decisión",
  paymentStatus: "Finalizada",
  bookingStatus: "FINALIZADA",
  decisionDeadline: "07/11/2026",
  daysRemaining: 2,
};

const initialMovements: DepositMovement[] = [
  {
    id: "mov-0",
    date: "01/11/2026",
    type: "COBRO",
    amount: 50,
    reason: "Cobro inicial de garantía",
    details: "Reserva #1",
  },
];

describe("DepositPageBody", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("completa el flujo de devolución de depósito mediante la server action", async () => {
    const user = userEvent.setup();
    mockedRefundDepositAction.mockResolvedValueOnce({
      ok: true,
      message: depositMessages.refundSuccessNotice,
      data: {
        id: "dep-1",
        bookingId: "res-1",
        state: "RETURNED",
        amount: "50.00",
        retainedAmount: "0.00",
        returnedAmount: "50.00",
        decidedAt: "2026-11-05T12:00:00Z",
      },
    });

    render(
      <DepositPageBody
        depositInfo={baseDepositInfo}
        initialMovements={initialMovements}
      />
    );

    expect(
      screen.getByRole("heading", { level: 1, name: depositMessages.pageTitle })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: depositMessages.refundButton })
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Confirmar devolución" })
    );

    expect(mockedRefundDepositAction).toHaveBeenCalledWith("res-1");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      depositMessages.refundSuccessNotice
    );
    expect(screen.getByText("Devuelto")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const table = screen.getByRole("table");
    expect(within(table).getByText("DEVOLUCIÓN")).toBeInTheDocument();
    expect(
      within(table).getByText("Devolución de depósito de garantía")
    ).toBeInTheDocument();
  });

  it("muestra alerta de error cuando falla la devolución", async () => {
    const user = userEvent.setup();
    mockedRefundDepositAction.mockResolvedValueOnce({
      ok: false,
      message: "Solo el arrendador dueño puede decidir.",
    });

    render(
      <DepositPageBody depositInfo={baseDepositInfo} bookingId="book-custom" />
    );

    await user.click(
      screen.getByRole("button", { name: depositMessages.refundButton })
    );
    await user.click(
      screen.getByRole("button", { name: "Confirmar devolución" })
    );

    expect(mockedRefundDepositAction).toHaveBeenCalledWith("book-custom");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Solo el arrendador dueño puede decidir."
    );
    expect(screen.getByText("Pendiente de decisión")).toBeInTheDocument();
  });

  it("completa retención parcial agregando movimiento de retención y devolución automática", async () => {
    const user = userEvent.setup();
    mockedRetainDepositAction.mockResolvedValueOnce({
      ok: true,
      message: depositMessages.retentionSuccessNotice,
      data: {
        id: "dep-1",
        bookingId: "res-1",
        state: "PARTIALLY_RETAINED",
        amount: "50.00",
        retainedAmount: "20.00",
        returnedAmount: "30.00",
        decidedAt: "2026-11-05T12:00:00Z",
      },
    });

    render(<DepositPageBody depositInfo={baseDepositInfo} />);

    await user.click(
      screen.getByRole("button", { name: depositMessages.retainButton })
    );

    const amountInput = screen.getByLabelText(depositMessages.retainAmountLabel);
    const reasonTextarea = screen.getByLabelText(depositMessages.retainReasonLabel);

    await user.clear(amountInput);
    await user.type(amountInput, "20");
    await user.type(reasonTextarea, "Daño menor en correa de transporte");

    await user.click(
      screen.getByRole("button", { name: depositMessages.confirmRetentionButton })
    );

    expect(mockedRetainDepositAction).toHaveBeenCalledWith("res-1", {
      amount: 20,
      reason: "Daño menor en correa de transporte",
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      depositMessages.retentionSuccessNotice
    );
    expect(screen.getByText("Retenido parcialmente")).toBeInTheDocument();

    const table = screen.getByRole("table");
    expect(within(table).getByText("RETENCIÓN")).toBeInTheDocument();
    expect(within(table).getByText("$20.00")).toBeInTheDocument();
    expect(within(table).getByText("DEVOLUCIÓN")).toBeInTheDocument();
    expect(within(table).getByText("$30.00")).toBeInTheDocument();
  });

  it("propaga errores al formulario en retención y soporta retención total con callback", async () => {
    const user = userEvent.setup();
    const onRetainDeposit = jest
      .fn()
      .mockRejectedValueOnce(new Error("Fallo de validación"))
      .mockResolvedValueOnce(undefined);

    render(
      <DepositPageBody
        depositInfo={baseDepositInfo}
        onRetainDeposit={onRetainDeposit}
      />
    );

    await user.click(
      screen.getByRole("button", { name: depositMessages.retainButton })
    );

    await user.type(
      screen.getByLabelText(depositMessages.retainReasonLabel),
      "Pérdida completa de accesorio incluido"
    );

    await user.click(
      screen.getByRole("button", { name: depositMessages.confirmRetentionButton })
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Fallo de validación"
    );

    await user.click(
      screen.getByRole("button", { name: depositMessages.confirmRetentionButton })
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      depositMessages.retentionSuccessNotice
    );
    expect(screen.getByText("Retenido")).toBeInTheDocument();
  });

  it("muestra aviso y oculta controles cuando la reserva no está finalizada", () => {
    render(
      <DepositPageBody
        depositInfo={{
          ...baseDepositInfo,
          paymentStatus: "Pagada",
          bookingStatus: "PAGADA",
        }}
      />
    );

    expect(
      screen.getByText(depositMessages.notFinalizedNotice)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: depositMessages.refundButton })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: depositMessages.retainButton })
    ).not.toBeInTheDocument();
  });
});

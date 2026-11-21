import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DepositOrderInfoCard } from "./deposit-order-info-card";
import { depositMessages } from "@/lib/messages/deposit";
import type { DepositInfo } from "@/types";

const finalizedPendingDeposit: DepositInfo = {
  id: "dep-1",
  reservationId: "res-1",
  itemTitle: "Dron DJI Mini 4 Pro",
  rentalPeriod: "10/11/2026 – 12/11/2026",
  depositAmount: 100,
  status: "Pendiente de decisión",
  paymentStatus: "Finalizada",
  bookingStatus: "FINALIZADA",
  decisionDeadline: "15/11/2026",
  daysRemaining: 1,
};

describe("DepositOrderInfoCard", () => {
  it("renderiza información de la orden y habilita acciones cuando está finalizada y pendiente", async () => {
    const user = userEvent.setup();
    const onRefundClick = jest.fn();
    const onRetainClick = jest.fn();

    render(
      <DepositOrderInfoCard
        depositInfo={finalizedPendingDeposit}
        onRefundClick={onRefundClick}
        onRetainClick={onRetainClick}
      />
    );

    expect(
      screen.getByRole("heading", { name: depositMessages.orderInfoTitle })
    ).toBeInTheDocument();
    expect(screen.getByText("Finalizada")).toBeInTheDocument();
    expect(screen.getByText("Dron DJI Mini 4 Pro")).toBeInTheDocument();
    expect(screen.getByText("10/11/2026 – 12/11/2026")).toBeInTheDocument();
    expect(screen.getByText("$100.00")).toBeInTheDocument();
    expect(screen.getByText("Pendiente de decisión")).toBeInTheDocument();
    expect(
      screen.getByText(depositMessages.deadlineNotice("15/11/2026", 1))
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: depositMessages.refundButton })
    );
    await user.click(
      screen.getByRole("button", { name: depositMessages.retainButton })
    );

    expect(onRefundClick).toHaveBeenCalledTimes(1);
    expect(onRetainClick).toHaveBeenCalledTimes(1);
  });

  it("refleja los estados isRefunding, isRetaining y pluralización de días", () => {
    render(
      <DepositOrderInfoCard
        depositInfo={{
          ...finalizedPendingDeposit,
          daysRemaining: 3,
        }}
        isRefunding
        isRetaining
      />
    );

    expect(
      screen.getByText(depositMessages.deadlineNotice("15/11/2026", 3))
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: depositMessages.refundingState })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: depositMessages.retainButton }).className
    ).toContain("ring-2");
  });

  it("muestra aviso si está pendiente pero la reserva aún no está finalizada", () => {
    render(
      <DepositOrderInfoCard
        depositInfo={{
          ...finalizedPendingDeposit,
          paymentStatus: "Pagada",
          bookingStatus: "PAGADA",
          decisionDeadline: "",
        }}
      />
    );

    expect(screen.getByText("Pagada")).toBeInTheDocument();
    expect(
      screen.getByText(depositMessages.notFinalizedNoticeTitle)
    ).toBeInTheDocument();
    expect(
      screen.getByText(depositMessages.notFinalizedNotice)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: depositMessages.refundButton })
    ).not.toBeInTheDocument();
  });

  it("muestra mensaje informativo cuando el depósito ya fue procesado", () => {
    render(
      <DepositOrderInfoCard
        depositInfo={{
          ...finalizedPendingDeposit,
          status: "Devuelto",
        }}
      />
    );

    expect(
      screen.getByText("Este depósito ya fue procesado (devuelto).")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: depositMessages.retainButton })
    ).not.toBeInTheDocument();
  });
});

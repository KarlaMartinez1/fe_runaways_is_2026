import type {
  CreateDepositDecisionInput,
  BackendDepositDecisionResponse,
  BackendDepositStatus,
} from "@/lib/api/types";
import {
  depositMessages,
  backendDepositStateLabels,
} from "@/lib/messages/deposit";
import type { RetainDepositFormData } from "@/types";
import type { DepositRepository } from "../deposit-repository";
import {
  defaultDepositInfo,
  depositInfoFixtures,
  depositMovementsFixtures,
} from "./fixtures/deposits";

export const mockDepositRepository: DepositRepository = {
  async getDepositInfo(reservationId: string) {
    return (
      depositInfoFixtures[reservationId] ??
      depositInfoFixtures.default ??
      defaultDepositInfo
    );
  },

  async getDepositMovements(reservationId: string) {
    return (
      depositMovementsFixtures[reservationId] ??
      depositMovementsFixtures.default ??
      []
    );
  },

  async decideDeposit(
    bookingId: string,
    input: CreateDepositDecisionInput
  ): Promise<BackendDepositDecisionResponse> {
    const existing =
      depositInfoFixtures[bookingId] ??
      depositInfoFixtures.default ??
      defaultDepositInfo;

    const totalDeposit = existing.depositAmount || 50.0;
    const isReturning = input.decisionType === "DEVOLVER";
    const retainedNum = isReturning
      ? 0
      : parseFloat(input.retentionAmount || "0");
    const returnedNum = Math.max(0, totalDeposit - retainedNum);

    const backendState: BackendDepositStatus = isReturning
      ? "RETURNED"
      : retainedNum < totalDeposit
      ? "PARTIALLY_RETAINED"
      : "RETAINED";

    depositInfoFixtures[bookingId] = {
      ...existing,
      status: backendDepositStateLabels[backendState],
    };

    const newMovements = [
      ...(depositMovementsFixtures[bookingId] ??
        depositMovementsFixtures.default ??
        []),
    ];

    if (isReturning) {
      newMovements.push({
        id: `mov-refund-${Date.now()}`,
        date: new Date().toLocaleDateString("es-ES"),
        type: "DEVOLUCIÓN",
        amount: totalDeposit,
        reason: "Devolución de depósito de garantía",
        details: "Cuenta de origen",
      });
    } else {
      newMovements.push({
        id: `mov-retain-${Date.now()}`,
        date: new Date().toLocaleDateString("es-ES"),
        type: "RETENCIÓN",
        amount: retainedNum,
        reason: input.retentionReason || "Retención de garantía",
        details: "Retención de garantía",
      });

      if (returnedNum > 0) {
        newMovements.push({
          id: `mov-refund-part-${Date.now()}`,
          date: new Date().toLocaleDateString("es-ES"),
          type: "DEVOLUCIÓN",
          amount: returnedNum,
          reason: "Devolución automática de diferencia no retenida",
          details: "Cuenta de origen",
        });
      }
    }

    depositMovementsFixtures[bookingId] = newMovements;

    return {
      id: `dep-${bookingId}`,
      bookingId,
      state: backendState,
      amount: totalDeposit.toFixed(2),
      retainedAmount: retainedNum.toFixed(2),
      returnedAmount: returnedNum.toFixed(2),
      decidedAt: new Date().toISOString(),
    };
  },

  async refundDeposit(reservationId: string) {
    await this.decideDeposit(reservationId, {
      decisionType: "DEVOLVER",
    });
    return {
      success: true,
      message: depositMessages.refundSuccessNotice,
    };
  },

  async retainDeposit(reservationId: string, data: RetainDepositFormData) {
    await this.decideDeposit(reservationId, {
      decisionType: "RETENER",
      retentionAmount: typeof data.amount === "number" ? data.amount.toFixed(2) : String(data.amount),
      retentionReason: data.reason,
    });
    return {
      success: true,
      message: depositMessages.retentionSuccessNotice,
    };
  },
};

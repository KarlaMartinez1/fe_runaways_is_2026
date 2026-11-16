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

  async refundDeposit(reservationId: string) {
    return {
      success: true,
      message: `El depósito para la reserva ${reservationId} fue devuelto con éxito al arrendatario.`,
    };
  },

  async retainDeposit(reservationId: string, data: RetainDepositFormData) {
    return {
      success: true,
      message: `Se retuvo un monto de $${data.amount.toFixed(2)} del depósito de la reserva ${reservationId}.`,
    };
  },
};

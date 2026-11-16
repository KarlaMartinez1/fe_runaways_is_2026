import { ApiError, apiGet, apiPost } from "@/lib/api/client";
import type {
  DepositInfo,
  DepositMovement,
  RetainDepositFormData,
} from "@/types";
import type { DepositRepository } from "../deposit-repository";

export const httpDepositRepository: DepositRepository = {
  async getDepositInfo(reservationId: string) {
    try {
      return await apiGet<DepositInfo>(
        `api/v1/reservations/${encodeURIComponent(reservationId)}/deposit`
      );
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 404 || error.status === 400)
      ) {
        return null;
      }
      throw error;
    }
  },

  async getDepositMovements(reservationId: string) {
    try {
      return await apiGet<DepositMovement[]>(
        `api/v1/reservations/${encodeURIComponent(reservationId)}/deposit/movements`
      );
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 404 || error.status === 400)
      ) {
        return [];
      }
      throw error;
    }
  },

  async refundDeposit(reservationId: string) {
    return await apiPost<{ success: boolean; message: string }>(
      `api/v1/reservations/${encodeURIComponent(reservationId)}/deposit/refund`,
      {}
    );
  },

  async retainDeposit(reservationId: string, data: RetainDepositFormData) {
    return await apiPost<{ success: boolean; message: string }, RetainDepositFormData>(
      `api/v1/reservations/${encodeURIComponent(reservationId)}/deposit/retain`,
      data
    );
  },
};

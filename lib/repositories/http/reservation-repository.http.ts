import { ApiError, apiGet, apiPost } from "@/lib/api/client";
import type {
  PaymentReceiptDetail,
  PaymentSubmissionResult,
  ReservationDetail,
  ReservationMovement,
} from "@/types";
import type { ReservationRepository } from "../reservation-repository";

export const httpReservationRepository: ReservationRepository = {
  async getReservationById(id: string) {
    try {
      return await apiGet<ReservationDetail>(
        `api/v1/reservations/${encodeURIComponent(id)}`
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

  async getMovements(reservationId: string) {
    try {
      return await apiGet<ReservationMovement[]>(
        `api/v1/reservations/${encodeURIComponent(reservationId)}/movements`
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

  async getReceiptById(receiptId: string) {
    try {
      return await apiGet<PaymentReceiptDetail>(
        `api/v1/receipts/${encodeURIComponent(receiptId)}`
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

  async payReservation(reservationId: string, paymentData: unknown) {
    return await apiPost<PaymentSubmissionResult, unknown>(
      `api/v1/reservations/${encodeURIComponent(reservationId)}/pay`,
      paymentData
    );
  },
};

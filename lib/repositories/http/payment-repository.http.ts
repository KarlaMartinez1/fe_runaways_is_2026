import { apiGet, apiPost, ApiError } from "@/lib/api/client";
import type {
  BackendPaymentReceipt,
  BackendPaymentSummary,
  CreatePaymentInput,
} from "@/lib/api/types";
import type { PaymentRepository } from "../payment-repository";

export const httpPaymentRepository: PaymentRepository = {
  async getSummary(bookingId: string) {
    try {
      return await apiGet<BackendPaymentSummary>(
        `api/v1/payments/${encodeURIComponent(bookingId)}/summary`
      );
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 404 || error.status === 400 || error.status === 409)
      ) {
        return null;
      }
      throw error;
    }
  },

  async pay(input: CreatePaymentInput) {
    return await apiPost<BackendPaymentReceipt>("api/v1/payments", input);
  },
};

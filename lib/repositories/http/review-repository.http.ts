import { ApiError, apiGet, apiPost } from "@/lib/api/client";
import type {
  PropertyReviewInput,
  PropertyReviewResult,
  ReservationForReview,
} from "@/lib/api/types";
import type { ReviewRepository } from "../review-repository";

export const httpReviewRepository: ReviewRepository = {
  async getReservationForReview(reservationId) {
    try {
      // PENDIENTE DE CONTRATO: el backend aún no define cómo leer una reserva para calificarla.
      return await apiGet<ReservationForReview>(
        `api/v1/bookings/${encodeURIComponent(reservationId)}`,
      );
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
        return null;
      }
      throw error;
    }
  },

  submitPropertyReview(reservationId, input) {
    return apiPost<PropertyReviewResult>(
      `api/v1/reservations/${encodeURIComponent(reservationId)}/reviews/property`,
      input,
    );
  },
};
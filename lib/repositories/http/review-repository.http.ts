import { ApiError, apiGet, apiPost } from "@/lib/api/client";
import type {
  PropertyReviewResult,
  ReservationForReview,
} from "@/lib/api/types";
import type { ReviewRepository } from "../review-repository";

export const httpReviewRepository: ReviewRepository = {
  async getTenantReviewSummary(tenantId) {
    const result = await apiGet<{ averageRating?: number | null; average?: number | null; reviewCount?: number; count?: number; data?: Array<{ rating?: number; userRating?: number }> }>(`api/v1/tenants/${encodeURIComponent(tenantId)}/reviews`);
    const ratings = result.data?.map((item) => item.rating ?? item.userRating ?? 0).filter((rating) => rating > 0) ?? [];
    return {
      average: result.averageRating ?? result.average ?? (ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null),
      count: result.reviewCount ?? result.count ?? ratings.length,
    };
  },
  async submitRenterReview(reservationId, input) {
    await apiPost<void, { rating: number; comment?: string }>(`api/v1/reservations/${encodeURIComponent(reservationId)}/reviews/renter`, input);
  },
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

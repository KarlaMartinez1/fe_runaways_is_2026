import type {
  PropertyReviewInput,
  PropertyReviewResult,
  ReservationForReview,
} from "@/lib/api/types";

export interface ReviewRepository {
  // Devuelve null si la reserva no existe o no es del usuario (el backend responde 404).
  getReservationForReview(reservationId: string): Promise<ReservationForReview | null>;
  submitPropertyReview(
    reservationId: string,
    input: PropertyReviewInput,
  ): Promise<PropertyReviewResult>;
  getTenantReviewSummary(tenantId: string): Promise<{ average: number | null; count: number }>;
  submitRenterReview(reservationId: string, input: { userRating: number; comment?: string }): Promise<void>;
}

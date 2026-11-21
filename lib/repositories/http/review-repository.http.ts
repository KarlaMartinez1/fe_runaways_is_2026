import { apiGet, apiPost } from "@/lib/api/client";
import type {
  PropertyReviewResult,
  ReservationForReview,
} from "@/lib/api/types";
import type { ReviewRepository } from "../review-repository";
import { httpBookingRepository } from "./booking-repository.http";
import { httpPropertyRepository } from "./property-repository.http";

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
    await apiPost<void, { userRating: number; comment?: string }>(`api/v1/reservations/${encodeURIComponent(reservationId)}/reviews/renter`, input);
  },
  async getReservationForReview(reservationId) {
    // The backend exposes the review flag on the booking list, not a single-booking GET.
    let page = await httpBookingRepository.listMine({ page: 1, status: "FINALIZADA" });
    let booking = page.data.find((item) => item.id === reservationId);
    for (let current = 2; !booking && current <= page.totalPages; current += 1) {
      page = await httpBookingRepository.listMine({ page: current, status: "FINALIZADA" });
      booking = page.data.find((item) => item.id === reservationId);
    }
    if (!booking) return null;

    const property = await httpPropertyRepository.getById(booking.propertyId);
    if (!property) return null;
    return {
      id: booking.id,
      propertyId: booking.propertyId,
      propertyTitle: booking.propertyTitle || property.title,
      propertyImage: property.images[0] ?? null,
      startDate: booking.startDate,
      endDate: booking.endDate,
      days: booking.days,
      subtotal: booking.subtotal,
      securityDeposit: property.securityDeposit,
      status: booking.status,
      finalizedAt: booking.finalizedAt ?? null,
      ratedByMe: booking.hasPropertyReview ?? false,
    } satisfies ReservationForReview;
  },

  submitPropertyReview(reservationId, input) {
    return apiPost<PropertyReviewResult>(
      `api/v1/reservations/${encodeURIComponent(reservationId)}/reviews/property`,
      input,
    );
  },
};

import { ApiError } from "@/lib/api/client";
import type {
  PropertyReviewInput,
  PropertyReviewResult,
  ReservationForReview,
  ReviewBlockReason,
} from "@/lib/api/types";
import { calculateSubtotal } from "@/lib/bookings/rules";
import { reviewMessages } from "@/lib/messages/reviews";
import {
  blockReasonMessage,
  getRatingBlockReason,
  validateReviewInput,
} from "@/lib/reviews/rules";
import type { ReviewRepository } from "../review-repository";
import { propertyFixtures } from "./fixtures/properties";
import { defaultDetailExtras, propertyDetailExtras } from "./fixtures/property-details";
import {
  MOCK_CURRENT_USER_ID,
  rateableReservationSeeds,
  type RateableReservationSeed,
} from "./fixtures/rateable-reservations";
import {
  getOwnerRatingSummary,
  getPropertyOwnerName,
  getPropertyReviews,
  isReservationRated,
  recordPropertyReview,
} from "./review-store";
import { mockUserProfileFixture } from "./fixtures/profile";

// Códigos que devuelve el backend para cada motivo de bloqueo (409).
const BLOCK_ERROR_CODES: Record<ReviewBlockReason, string> = {
  NOT_FINALIZED: "BOOKING_NOT_FINALIZED",
  ALREADY_REVIEWED: "ALREADY_REVIEWED",
  WINDOW_CLOSED: "REVIEW_WINDOW_CLOSED",
};

// Solo devuelve reservas del usuario en sesión; si no lo son, devuelve undefined.
function findOwnedSeed(reservationId: string): RateableReservationSeed | undefined {
  return rateableReservationSeeds.find(
    (seed) => seed.id === reservationId && seed.lesseeId === MOCK_CURRENT_USER_ID,
  );
}

function toReservationForReview(seed: RateableReservationSeed): ReservationForReview | null {
  const property = propertyFixtures.find((item) => item.id === seed.propertyId);
  if (!property) return null;
  const extras = propertyDetailExtras[seed.propertyId] ?? defaultDetailExtras;

  return {
    id: seed.id,
    propertyId: property.id,
    propertyTitle: property.title,
    propertyImage: property.images[0] ?? null,
    startDate: seed.startDate,
    endDate: seed.endDate,
    days: seed.days,
    subtotal: calculateSubtotal(property.pricePerDay, seed.days),
    securityDeposit: extras.securityDeposit,
    status: seed.status,
    finalizedAt: seed.finalizedAt,
    ratedByMe: isReservationRated(seed.id),
  };
}

export const mockReviewRepository: ReviewRepository = {
  async getTenantReviewSummary() { return { average: null, count: 0 }; },
  async submitRenterReview() {},
  async getReservationForReview(reservationId) {
    const seed = findOwnedSeed(reservationId);
    return seed ? toReservationForReview(seed) : null;
  },

  async submitPropertyReview(reservationId, input: PropertyReviewInput): Promise<PropertyReviewResult> {
    const seed = findOwnedSeed(reservationId);
    if (!seed) {
      throw new ApiError(404, "NOT_FOUND", reviewMessages.errors.notFound);
    }

    const validationError = validateReviewInput(input);
    if (validationError) {
      throw new ApiError(400, "VALIDATION_ERROR", validationError);
    }

    const reservation = toReservationForReview(seed);
    const blockReason = reservation
      ? getRatingBlockReason(reservation)
      : "NOT_FINALIZED";
    if (blockReason) {
      throw new ApiError(409, BLOCK_ERROR_CODES[blockReason], blockReasonMessage[blockReason]);
    }

    const reviewCreatedAt = new Date().toISOString();
    const summary = recordPropertyReview({
      reservationId,
      propertyId: seed.propertyId,
      propertyRating: input.propertyRating,
      userRating: input.userRating,
      comment: input.comment,
      reviewerName: mockUserProfileFixture.fullName,
      createdAt: reviewCreatedAt,
    });

    const property = propertyFixtures.find((item) => item.id === seed.propertyId)!;
    const ownerName = getPropertyOwnerName(seed.propertyId);
    const ownerSummary = getOwnerRatingSummary(ownerName);

    return {
      id: property.id,
      title: property.title,
      description: (propertyDetailExtras[seed.propertyId] ?? defaultDetailExtras).description,
      category: property.category,
      department: property.department,
      municipality: property.municipality,
      pricePerDay: property.pricePerDay,
      securityDeposit: (propertyDetailExtras[seed.propertyId] ?? defaultDetailExtras).securityDeposit,
      images: property.images,
      owner: { id: "mock-owner", name: ownerName },
      propertyRatingAverage: summary.averageRating?.toFixed(1) ?? null,
      propertyReviewCount: summary.reviewCount,
      ownerRatingAverage: ownerSummary.averageRating?.toFixed(1) ?? null,
      ownerReviewCount: ownerSummary.reviewCount,
      reviews: getPropertyReviews(seed.propertyId).map((review) => ({
        id: review.id,
        propertyRating: review.rating,
        comment: review.comment ?? null,
        createdAt: review.createdAt,
        author: { name: review.reviewerName },
      })),
      reviewCreatedAt,
    };
  },
};

export { getPropertyOwnerName };

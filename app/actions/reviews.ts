"use server";

import { ApiError } from "@/lib/api/client";
import { bookingMessages } from "@/lib/messages/bookings";
import { reviewMessages } from "@/lib/messages/reviews";
import { validateReviewInput } from "@/lib/reviews/rules";
import { reviewRepository } from "@/lib/repositories";

export type SubmitPropertyReviewResult =
  | { ok: true; reviewCreatedAt: string }
  | { ok: false; message: string; sessionExpired?: boolean };

// Mensajes para los 409, según el código que devuelve el backend.
const conflictMessages: Record<string, string> = {
  BOOKING_NOT_FINALIZED: reviewMessages.errors.notFinalized,
  ALREADY_REVIEWED: reviewMessages.errors.alreadyReviewed,
  REVIEW_WINDOW_CLOSED: reviewMessages.errors.windowClosed,
};

export async function submitPropertyReviewAction(input: {
  reservationId: string;
  propertyRating: number;
  userRating: number;
  comment?: string;
}): Promise<SubmitPropertyReviewResult> {
  const comment = input.comment?.trim() || undefined;
  // Validar el mismo texto que se enviará al backend.
  const validationError = validateReviewInput({ ...input, comment });
  if (validationError) {
    return { ok: false, message: validationError };
  }

  try {
    const result = await reviewRepository.submitPropertyReview(input.reservationId, {
      propertyRating: input.propertyRating,
      userRating: input.userRating,
      comment,
    });
    return { ok: true, reviewCreatedAt: result.reviewCreatedAt };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        return { ok: false, message: bookingMessages.sessionExpired, sessionExpired: true };
      }
      if (error.status === 403) {
        return { ok: false, message: reviewMessages.errors.forbidden };
      }
      if (error.status === 404) {
        return { ok: false, message: reviewMessages.errors.notFound };
      }
      if (error.status === 409) {
        return {
          ok: false,
          message: (error.code && conflictMessages[error.code]) || error.message || reviewMessages.errors.submit,
        };
      }
      if (error.status === 400 && error.message) {
        return { ok: false, message: error.message };
      }
    }

    console.error("Error al enviar la calificación:", error);
    return { ok: false, message: reviewMessages.errors.submit };
  }
}

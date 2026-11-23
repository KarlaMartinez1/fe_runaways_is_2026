import type { BookingStatus, ReviewBlockReason } from "@/lib/api/types";
import { reviewMessages } from "@/lib/messages/reviews";

export const RATING_MIN = 1;
export const RATING_MAX = 5;
export const COMMENT_MAX_LENGTH = 200;

// Solo enteros de 1 a 5. Rechaza decimales, texto y valores fuera de rango.
export function isValidRating(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= RATING_MIN &&
    value <= RATING_MAX
  );
}

// El backend valida el plazo de 14 días al publicar; aquí solo se validan los datos disponibles.
export function getRatingBlockReason(
  reservation: { status: BookingStatus; ratedByMe: boolean },
): ReviewBlockReason | null {
  if (reservation.status !== "FINALIZADA") return "NOT_FINALIZED";
  if (reservation.ratedByMe) return "ALREADY_REVIEWED";
  return null;
}

export const blockReasonMessage: Record<ReviewBlockReason, string> = {
  NOT_FINALIZED: reviewMessages.errors.notFinalized,
  ALREADY_REVIEWED: reviewMessages.errors.alreadyReviewed,
};

// Valida el formulario. Devuelve el primer mensaje de error o null.
export function validateReviewInput(input: {
  propertyRating: unknown;
  userRating: unknown;
  comment?: string | null;
}): string | null {
  if (!isValidRating(input.propertyRating)) return reviewMessages.errors.propertyRating;
  if (!isValidRating(input.userRating)) return reviewMessages.errors.ownerRating;
  if (
    (input.comment ?? "").length > COMMENT_MAX_LENGTH
  ) {
    return reviewMessages.errors.comment;
  }
  return null;
}

import type { BookingStatus, ReviewBlockReason } from "@/lib/api/types";
import { reviewMessages } from "@/lib/messages/reviews";

export const RATING_MIN = 1;
export const RATING_MAX = 5;
export const COMMENT_MAX_LENGTH = 200;
export const REVIEW_WINDOW_DAYS = 14;

const DAY_MS = 86_400_000;

// Solo enteros de 1 a 5. Rechaza decimales, texto y valores fuera de rango.
export function isValidRating(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= RATING_MIN &&
    value <= RATING_MAX
  );
}

// Momento límite para calificar: 14 días después del último día de la reserva.
export function getReviewDeadline(endDate: string): number {
  const endOfLastRentalDay = new Date(`${endDate.slice(0, 10)}T23:59:59.999-06:00`).getTime();
  return endOfLastRentalDay + REVIEW_WINDOW_DAYS * DAY_MS;
}

// Devuelve el motivo por el que NO se puede calificar, o null si sí se puede.
export function getRatingBlockReason(
  reservation: { status: BookingStatus; finalizedAt?: string | null; endDate: string; ratedByMe: boolean },
  now: number = Date.now(),
): ReviewBlockReason | null {
  if (reservation.status !== "FINALIZADA") return "NOT_FINALIZED";
  if (reservation.ratedByMe) return "ALREADY_REVIEWED";
  const reviewDate = reservation.finalizedAt ?? reservation.endDate;
  if (now > getReviewDeadline(reviewDate)) return "WINDOW_CLOSED";
  return null;
}

export const blockReasonMessage: Record<ReviewBlockReason, string> = {
  NOT_FINALIZED: reviewMessages.errors.notFinalized,
  ALREADY_REVIEWED: reviewMessages.errors.alreadyReviewed,
  WINDOW_CLOSED: reviewMessages.errors.windowClosed,
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

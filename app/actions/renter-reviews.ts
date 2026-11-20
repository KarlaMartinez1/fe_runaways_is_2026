"use server";

import { ApiError } from "@/lib/api/client";
import { reviewRepository } from "@/lib/repositories";

export async function submitRenterReviewAction(reservationId: string, rating: number, comment: string) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || comment.trim().length < 10 || comment.length > 200) {
    return { ok: false as const, message: comment.trim().length < 10
      ? "El comentario debe tener al menos 10 caracteres."
      : "Selecciona una calificación de 1 a 5 y escribe hasta 200 caracteres." };
  }
  try {
    await reviewRepository.submitRenterReview(reservationId, { userRating: rating, comment: comment.trim() || undefined });
    return { ok: true as const };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return { ok: false as const, message: "Sesión expirada", sessionExpired: true };
    if (error instanceof ApiError && error.status === 403) return { ok: false as const, message: "No tienes permiso para ver esta página" };
    return { ok: false as const, message: error instanceof ApiError ? error.message : "No se pudo enviar la reseña. Intenta de nuevo." };
  }
}

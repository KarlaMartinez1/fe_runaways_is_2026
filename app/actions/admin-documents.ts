"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { adminDocumentsMessages as m } from "@/lib/messages/admin-documents";
import { adminRepository } from "@/lib/repositories";
import { isValidRejectionReason } from "@/lib/validations/document-review";

export type DocumentReviewResult = { ok: false; message: string };

// Traduce los errores del backend al mensaje de la pantalla.
// Devuelve null si el error es 401 (la acción redirige a /login).
function toErrorMessage(error: unknown): string | null {
  if (error instanceof ApiError) {
    if (error.status === 401) return null;
    if (error.status === 403) return m.forbidden;
    if (error.status === 404) return m.notFound;
    if (error.status === 409) return m.alreadyReviewed;
    if (error.status === 400 && error.message) return error.message;
  }
  console.error("Error al revisar el documento:", error);
  return m.actionError;
}

// H20: aprueba el documento y regresa a la lista con "Documento aprobado.".
export async function approveDocument(userId: string): Promise<DocumentReviewResult> {
  try {
    await adminRepository.approveDocument(userId);
  } catch (error) {
    const message = toErrorMessage(error);
    if (message === null) redirect("/login");
    return { ok: false, message };
  }

  revalidatePath("/admin/verifications");
  redirect("/admin/verifications?result=approved");
}

// H20: rechaza el documento con su motivo y regresa a la lista con "Documento rechazado.".
export async function rejectDocument(userId: string, reason: string): Promise<DocumentReviewResult> {
  if (!isValidRejectionReason(reason)) {
    return { ok: false, message: m.reasonLength };
  }

  try {
    await adminRepository.rejectDocument(userId, reason.trim());
  } catch (error) {
    const message = toErrorMessage(error);
    if (message === null) redirect("/login");
    return { ok: false, message };
  }

  revalidatePath("/admin/verifications");
  redirect("/admin/verifications?result=rejected");
}
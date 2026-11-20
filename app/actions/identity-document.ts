"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import type { IdentityDocumentInfo } from "@/lib/api/types";
import { identityDocumentMessages as m } from "@/lib/messages/identity-document";
import { identityDocumentRepository } from "@/lib/repositories";
import { getDocumentFileError, identityDocumentSchema } from "@/lib/validations/identity-document";

export type SubmitIdentityDocumentResult =
  | { ok: true; info: IdentityDocumentInfo }
  | { ok: false; message: string };

// H19: el archivo se recibe con el nombre documentUrl del contrato API.
export async function submitIdentityDocument(
  formData: FormData,
): Promise<SubmitIdentityDocumentResult> {
  const parsed = identityDocumentSchema.safeParse({
    documentType: formData.get("documentType"),
    documentNumber: formData.get("documentNumber"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? m.saveError };
  }

  const file = formData.get("documentUrl");
  const fileError = getDocumentFileError(file instanceof File ? file : null);
  if (fileError || !(file instanceof File)) {
    return { ok: false, message: fileError ?? m.fileRequired };
  }

  let unauthorized = false;
  let info: IdentityDocumentInfo | null = null;

  try {
    await identityDocumentRepository.submit({ ...parsed.data, file });
    info = await identityDocumentRepository.getMine();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else if (error instanceof ApiError && error.status === 403) {
      return { ok: false, message: m.forbidden };
    } else if (error instanceof ApiError && error.status === 409) {
      return { ok: false, message: m.alreadySubmitted };
    } else if (error instanceof ApiError && error.status === 413) {
      return { ok: false, message: m.fileSize };
    } else if (error instanceof ApiError && error.status === 400 && error.message) {
      return { ok: false, message: error.message };
    } else {
      console.error("Error al enviar el documento de identidad:", error);
      return { ok: false, message: m.saveError };
    }
  }

  if (unauthorized || !info) {
    redirect("/login");
  }

  revalidatePath("/profile");
  revalidatePath("/profile/verification");
  return { ok: true, info };
}
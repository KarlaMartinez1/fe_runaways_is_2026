"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { detailMessages } from "@/lib/messages/properties";
import { propertyFormMessages as m } from "@/lib/messages/property-form";
import { propertyRepository } from "@/lib/repositories";
import type { ManageableStatus } from "@/lib/repositories/property-repository";

export type PropertyStatusResult =
  | { ok: true; status: ManageableStatus }
  | { ok: false; message: string };

export type DeletePropertyResult = { ok: false; message: string };

// Traduce los errores del backend al mensaje de la historia.
// Devuelve null si el error es 401 (la acción redirige a /login).
function toErrorMessage(error: unknown): string | null {
  if (error instanceof ApiError) {
    if (error.status === 401) return null;
    if (error.status === 403) return m.forbidden;
    if (error.status === 404) return detailMessages.notAvailable;
    if (error.status === 409) return m.statusLocked;
  }
  console.error("Error al cambiar el estado del bien:", error);
  return m.saveError;
}

function revalidateProperty(id: string) {
  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath("/properties/mine");
  revalidatePath(`/properties/${id}`);
}

// H5: pausa (PAUSADO) o reactiva (DISPONIBLE) una publicación.
export async function changePropertyStatus(
  id: string,
  status: ManageableStatus,
): Promise<PropertyStatusResult> {
  let message: string | null = null;

  try {
    const result = await propertyRepository.changeStatus(id, status);
    revalidateProperty(id);
    return { ok: true, status: result.status === "PAUSADO" ? "PAUSADO" : "DISPONIBLE" };
  } catch (error) {
    message = toErrorMessage(error);
  }

  if (message === null) {
    redirect("/login");
  }
  return { ok: false, message };
}

// H5: elimina la publicación y regresa a "Mis publicaciones".
export async function deleteProperty(id: string): Promise<DeletePropertyResult> {
  let message: string | null = null;

  try {
    await propertyRepository.remove(id);
  } catch (error) {
    message = toErrorMessage(error);
    if (message === null) {
      redirect("/login");
    }
    return { ok: false, message };
  }

  revalidateProperty(id);
  redirect("/properties/mine");
}
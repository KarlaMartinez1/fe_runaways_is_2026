"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import type { PropertyCategory } from "@/lib/api/types";
import { propertyFormMessages as m } from "@/lib/messages/property-form";
import { propertyRepository } from "@/lib/repositories";
import {
  getPhotoCountError,
  propertyFormSchema,
  toMoney,
  type PropertyFormData,
} from "@/lib/validations/property-form";

export type CreatePropertyResult = {
  ok: false;
  message: string;
};

// H1: publica un bien. Si todo sale bien, redirige a "Mis publicaciones";
// si algo falla, devuelve el mensaje para mostrarlo en el formulario.
export async function createProperty(
  values: PropertyFormData,
  images: string[],
): Promise<CreatePropertyResult> {
  const parsed = propertyFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? m.saveError };
  }

  const photoError = getPhotoCountError(images.length);
  if (photoError) {
    return { ok: false, message: photoError };
  }

  const data = parsed.data;
  let unauthorized = false;

  try {
    await propertyRepository.create({
      title: data.title,
      description: data.description,
      // La regla del formulario ya garantiza que no está vacía.
      category: data.category as PropertyCategory,
      department: data.department,
      municipality: data.municipality,
      address: data.address,
      pricePerDay: toMoney(data.pricePerDay),
      securityDeposit: toMoney(data.securityDeposit),
      images,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else if (error instanceof ApiError && error.status === 403) {
      return { ok: false, message: m.forbidden };
    } else if (error instanceof ApiError && error.status === 400 && error.message) {
      return { ok: false, message: error.message };
    } else {
      console.error("Error al publicar el bien:", error);
      return { ok: false, message: m.saveError };
    }
  }

  if (unauthorized) {
    redirect("/login");
  }

  revalidatePath("/properties");
  revalidatePath("/");
  redirect("/properties/mine?published=1");
}
import { z } from "zod";
import { propertyFormMessages as m } from "@/lib/messages/property-form";

export const TITLE_MAX = 100;
export const DESCRIPTION_MIN = 30;
export const DESCRIPTION_MAX = 250;
export const ADDRESS_MAX = 250;
export const MONEY_MAX = 9999.99;

export const PHOTO_MIN_COUNT = 1;
export const PHOTO_MAX_COUNT = 5;
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png"];

// Precio por dia: obligatorio, de 0.01 a 9999.99, maximo 2 decimales.
const priceField = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    if (value === "") {
      ctx.addIssue({ code: "custom", message: m.priceRequired });
      return;
    }
    if (!/^\d+(\.\d+)?$/.test(value)) {
      ctx.addIssue({ code: "custom", message: m.priceInvalid });
      return;
    }
    if ((value.split(".")[1] ?? "").length > 2) {
      ctx.addIssue({ code: "custom", message: m.decimals });
      return;
    }
    const price = Number(value);
    if (price < 0.01 || price > MONEY_MAX) {
      ctx.addIssue({ code: "custom", message: m.priceRange });
    }
  });

// Deposito de garantia: opcional (vacio = 0.00), de 0.00 a 9999.99, maximo 2 decimales.
const depositField = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    if (value === "") return;
    if (!/^\d+(\.\d+)?$/.test(value)) {
      ctx.addIssue({ code: "custom", message: m.depositInvalid });
      return;
    }
    if ((value.split(".")[1] ?? "").length > 2) {
      ctx.addIssue({ code: "custom", message: m.decimals });
      return;
    }
    if (Number(value) > MONEY_MAX) {
      ctx.addIssue({ code: "custom", message: m.depositRange });
    }
  });

export const propertyFormSchema = z.object({
  title: z.string().trim().min(1, m.titleRequired).max(TITLE_MAX, m.titleMax),
  description: z
    .string()
    .trim()
    .min(DESCRIPTION_MIN, m.descriptionMin)
    .max(DESCRIPTION_MAX, m.descriptionMax),
  category: z
    .enum(["", "PROPIEDAD", "EQUIPO"])
    .refine((value) => value !== "", m.categoryRequired),
  department: z.string().min(1, m.departmentRequired),
  municipality: z.string().min(1, m.municipalityRequired),
  address: z.string().trim().min(1, m.addressRequired).max(ADDRESS_MAX, m.addressMax),
  pricePerDay: priceField,
  securityDeposit: depositField,
});

// Lo que se escribe en el formulario (la categoría puede estar vacía: "Seleccione categoría").
export type PropertyFormInput = z.input<typeof propertyFormSchema>;
// Lo que sale después de validar (la categoría ya es PROPIEDAD o EQUIPO).
export type PropertyFormData = z.output<typeof propertyFormSchema>;

// Revisa una foto al elegirla. Devuelve el mensaje de error o undefined si es valida.
export function getPhotoFileError(file: File) {
  if (!PHOTO_TYPES.includes(file.type)) return m.photoType;
  if (file.size > PHOTO_MAX_BYTES) return m.photoSize;
  return undefined;
}

// Revisa la cantidad total de fotos (de 1 a 5).
export function getPhotoCountError(count: number) {
  if (count < PHOTO_MIN_COUNT) return m.photosRequired;
  if (count > PHOTO_MAX_COUNT) return m.photosMax;
  return undefined;
}

// Convierte "45" o "45.5" en "45.00". Vacio se guarda como "0.00" (sin deposito).
export function toMoney(value: string) {
  return Number(value.trim() || "0").toFixed(2);
}
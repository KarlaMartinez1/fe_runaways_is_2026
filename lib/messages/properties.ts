import type { PropertyCategory } from "@/lib/api/types";

export const categoryLabels: Record<PropertyCategory, string> = {
  PROPIEDAD: "Propiedad",
  EQUIPO: "Equipo",
};

export const propertyMessages = {
  perDay: "por día",
  noRating: "Sin calificación",
};

export function formatPrice(value: string) {
  return `$${Number(value).toFixed(2)}`;
}
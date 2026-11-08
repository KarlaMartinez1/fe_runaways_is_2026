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
export const catalogMessages = {
  empty: "No hay bienes disponibles por el momento",
  loadError: "No se pudo cargar el catálogo. Intente de nuevo.",
};
export const homeMessages = {
  recentTitle: "Recién publicados",
  viewAll: "Ver catálogo completo",
};
export const galleryMessages = {
  previous: "Foto anterior",
  next: "Foto siguiente",
  goTo: (number: number) => `Ver foto ${number}`,
  photoAlt: (title: string, number: number, total: number) => `${title}, foto ${number} de ${total}`,
};
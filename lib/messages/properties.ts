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
export const bookingBoxMessages = {
  depositLabel: "Depósito de garantía",
  noDeposit: "Sin depósito",
  requiresVerification: "Requiere cuenta verificada",
  reserve: "Reservar",
  verificationRequired: "Debes verificar tu cuenta para rentar.",
  verifyAccount: "Verificar mi cuenta",
  askOwner: "Preguntar al arrendador",
};
export const detailMessages = {
  backToCatalog: "Volver al catálogo",
  notAvailable: "Este bien ya no está disponible",
  loadError: "No se pudo cargar el bien. Intente de nuevo.",
  noRatings: "Sin calificaciones",
  rating: (average: number, count: number) =>
    `★ ${average.toFixed(1)} (${count} ${count === 1 ? "reseña" : "reseñas"})`,
  ownerRole: "Arrendador",
};
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
  searchError: "No se pudo realizar la búsqueda. Intente de nuevo.",
  noResults: "No se encontraron resultados",
  clearFilters: "Limpiar filtros",
  resultCount: (total: number) =>
    total === 1 ? "1 resultado" : `${total} resultados`,
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
export const searchMessages = {
  queryLabel: "Qué buscas",
  queryPlaceholder: "Casa, cámara, proyector...",
  departmentLabel: "Departamento",
  municipalityLabel: "Municipio",
  categoryLabel: "Categoría",
  noDepositLabel: "Sin depósito",
  all: "Todos",
  allFeminine: "Todas",
  submit: "Buscar",
  minLength: "Ingrese al menos 2 caracteres.",
  maxLength: "El término no puede superar 100 caracteres.",
  selectDepartmentFirst: "Seleccione primero un departamento.",
  activeFilters: "Filtros activos",
  removeFilter: (label: string) => `Quitar filtro ${label}`,
  priceLabel: "Precio por día (USD)",
  priceMin: "Mínimo",
  priceMax: "Máximo",
  priceInvalid: "Ingrese un valor numérico mayor a 0.",
  priceDecimals: "Máximo 2 decimales.",
  priceTooHigh: "El precio no puede superar $9999.99.",
  priceRange: "El precio mínimo no puede ser mayor que el precio máximo.",
};
export const filterMessages = {
  categoryChips: { PROPIEDAD: "Propiedades", EQUIPO: "Equipo" },
  noDeposit: "Sin depósito",
  noResults: "No se encontraron resultados",
  clearFilters: "Limpiar filtros",
  searchError: "No se pudo realizar la búsqueda. Intente de nuevo.",
  resultsCount: (total: number) => (total === 1 ? "1 resultado" : `${total} resultados`),
  searchTag: (term: string) => `"${term}"`,
  removeFilter: (label: string) => `Quitar filtro ${label}`,
  priceChip: (min: number | undefined, max: number | undefined) => {
    const format = (value: number) => `$${value.toFixed(2)}`;
    if (min !== undefined && max !== undefined) return `${format(min)} – ${format(max)}`;
    if (min !== undefined) return `Desde ${format(min)}`;
    return `Hasta ${format(max ?? 0)}`;
  },
};
export const availabilityMessages = {
  label: "Fechas",
  openCalendar: "Ver disponibilidad",
  hideCalendar: "Ocultar calendario",
  loadError: "No se pudo cargar la disponibilidad. Intente de nuevo.",
  retry: "Reintentar",
  free: "Libre",
  occupied: "No disponible",
  outOfRange: "Fuera del periodo de reserva",
  previousMonth: "Mes anterior",
  nextMonth: "Mes siguiente",
  calendarLabel: "Calendario de disponibilidad",
  weekdays: ["L", "M", "M", "J", "V", "S", "D"],
};
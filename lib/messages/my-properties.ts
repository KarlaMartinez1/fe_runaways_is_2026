import type { PropertyStatus } from "@/lib/api/types";

// Textos de "Mis publicaciones" (H4). Título, botón y etiquetas de estado: Figma.
export const myPropertiesMessages = {
  title: "Mis publicaciones",
  publishNew: "+ Publicar bien",
  empty: "Aún no tienes publicaciones",
  loadError: "No se pudieron cargar tus publicaciones. Intente de nuevo.",
};

// Estado de cada bien en su tarjeta. ELIMINADO no aparece en la lista.
export const propertyStatusLabels: Record<PropertyStatus, string> = {
  DISPONIBLE: "Disponible",
  PAUSADO: "Pausada",
  ELIMINADO: "Eliminado",
};
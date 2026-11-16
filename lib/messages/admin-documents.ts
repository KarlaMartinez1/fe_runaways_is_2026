import type { IdentityDocumentStatus } from "@/lib/api/types";

// Textos de "Revisión de documentos" (H20). Títulos y etiquetas: Figma.
// Mensajes de resultado, lista vacía y regla del motivo: card de Trello H20.
export const adminDocumentsMessages = {
  // Lista
  listTitle: "Revisión de documentos",
  pendingCount: (total: number) => `${total} ${total === 1 ? "pendiente" : "pendientes"}`,
  userColumn: "Usuario",
  typeColumn: "Tipo",
  numberColumn: "Número",
  submittedColumn: "Fecha de envío",
  review: "Revisar",
  empty: "No hay documentos pendientes de revisión.",
  listLoadError: "No se pudieron cargar los documentos. Intente de nuevo.",

  // Revisión
  backToList: "Volver a la lista",
  reviewTitle: "Revisar documento",
  typeLabel: "Tipo",
  numberLabel: "Número",
  submittedLabel: "Enviado",
  statusLabel: "Estado",
  documentTitle: (name: string) => `Documento de identidad de ${name}`,
  approve: "Aprobar",
  reject: "Rechazar",
  notFound: "Documento no encontrado.",
  reviewLoadError: "No se pudo cargar el documento. Intente de nuevo.",

  // Rechazo
  rejectTitle: "Rechazar documento",
  reasonLabel: "Motivo del rechazo",
  reasonLength: "El motivo debe tener entre 10 y 300 caracteres.",
  reasonCounter: (length: number) => `${length}/300`,
  cancel: "Cancelar",
  confirmReject: "Confirmar rechazo",

  // Resultado
  approved: "Documento aprobado.",
  rejected: "Documento rechazado.",
  alreadyReviewed: "Este documento ya fue revisado.",
  actionError: "No se pudo completar la revisión. Intente de nuevo.",
  forbidden: "No tienes permiso para ver esta página",
};

export const documentStatusLabels: Record<IdentityDocumentStatus, string> = {
  PENDIENTE: "Pendiente",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
};
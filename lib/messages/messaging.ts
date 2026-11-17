import type { BookingStatus } from "@/lib/api/types";

// Textos de mensajería (H15 y H16). Títulos y etiquetas: Figma. Reglas: cards de Trello.
export const messagingMessages = {
  title: "Mensajes",
  you: "Tú",
  youPrefix: "Tú: ",
  yesterday: "Ayer",
  unread: "Mensaje sin leer",
  backToList: "Volver a mensajes",
  emptyList: "Aún no tienes conversaciones.",
  selectConversation: "Selecciona una conversación para ver los mensajes.",
  noMessages: "Aún no hay mensajes. Escribe el primero.",
  messageLabel: "Mensaje",
  messagePlaceholder: "Escribe un mensaje",
  send: "Enviar",
  sending: "Enviando...",
  meta: (author: string, dateTime: string) => `${author} · ${dateTime}`,

  // Errores
  emptyMessage: "El mensaje no puede estar vacío.",
  tooLong: "El mensaje no puede superar 500 caracteres.",
  selfMessage: "No puedes enviarte un mensaje a ti mismo.",
  notFound: "Conversación no encontrada.",
  loadError: "No se pudieron cargar los mensajes. Intente de nuevo.",
  sendError: "No se pudo enviar el mensaje. Intente de nuevo.",
  startError: "No se pudo abrir la conversación. Intente de nuevo.",
  forbidden: "No tienes permiso para ver esta página",
};

export const bookingStatusLabels: Record<BookingStatus, string> = {
  PENDIENTE: "Pendiente",
  PAGADA: "Pagada",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
};
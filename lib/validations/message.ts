import { messagingMessages as m } from "@/lib/messages/messaging";

export const MESSAGE_MAX = 500;

// H15: el mensaje es de 1 a 500 caracteres y no puede estar vacío (ni solo espacios).
// Devuelve el error o undefined si es válido.
export function getMessageError(content: string) {
  if (content.trim().length === 0) return m.emptyMessage;
  if (content.length > MESSAGE_MAX) return m.tooLong;
  return undefined;
}
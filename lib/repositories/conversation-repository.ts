import type { ChatMessage, ConversationSummary } from "@/lib/api/types";

// H15: mensajería entre arrendatario y arrendador (un hilo por bien y arrendatario).
export interface ConversationRepository {
  // GET /api/v1/conversations: hilos del usuario en sesión, del más reciente al más antiguo.
  list(): Promise<ConversationSummary[]>;
  // GET /api/v1/conversations/:id/messages: mensajes en orden cronológico.
  // Supuesto: al leerlos, el backend marca como leídos los mensajes recibidos.
  getMessages(conversationId: string): Promise<ChatMessage[]>;
  // POST /api/v1/conversations/:id/messages
  sendMessage(conversationId: string, content: string): Promise<ChatMessage>;
  // Abre el hilo del bien para el arrendatario en sesión (lo crea si no existe).
  // Pendiente de confirmar con backend: POST /api/v1/conversations con { propertyId }.
  startForProperty(propertyId: string): Promise<{ id: string }>;
}
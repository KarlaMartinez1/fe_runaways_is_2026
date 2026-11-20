import { apiGet, apiPost } from "@/lib/api/client";
import type { ChatMessage, ConversationSummary } from "@/lib/api/types";
import type { ConversationRepository } from "../conversation-repository";

// Elemento de GET /api/v1/conversations.
type ApiConversationSummary = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  participantId: string;
  participantName: string;
  unreadCount: number;
  lastMessageAt: string | null;
};

export const httpConversationRepository: ConversationRepository = {
  // H15: el backend no envía el texto del último mensaje ni la reserva del hilo; la lista
  // muestra nombre, bien, fecha y el indicador de no leído.
  async list() {
    const conversations = await apiGet<ApiConversationSummary[]>("api/v1/conversations");
    return conversations.map(
      (item): ConversationSummary => ({
        id: item.id,
        propertyId: item.propertyId,
        otherParticipantId: item.participantId,
        propertyTitle: item.propertyTitle,
        otherParticipantName: item.participantName,
        lastMessage: null,
        lastMessageAt: item.lastMessageAt,
        lastMessageIsMine: false,
        unreadCount: item.unreadCount,
        booking: null,
      }),
    );
  },

  getMessages(conversationId) {
    return apiGet<ChatMessage[]>(
      `api/v1/conversations/${encodeURIComponent(conversationId)}/messages`,
    );
  },

  sendMessage(conversationId, content) {
    return apiPost<ChatMessage, { content: string }>(
      `api/v1/conversations/${encodeURIComponent(conversationId)}/messages`,
      { content },
    );
  },

  // Pendiente de confirmar con backend (la card no define cómo abrir el hilo de un bien).
  startForProperty(propertyId) {
    return apiPost<{ id: string }, { propertyId: string }>("api/v1/conversations", { propertyId });
  },
};

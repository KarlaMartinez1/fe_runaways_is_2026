import { apiGet, apiPost } from "@/lib/api/client";
import type { ChatMessage, ConversationSummary } from "@/lib/api/types";
import type { ConversationRepository } from "../conversation-repository";

export const httpConversationRepository: ConversationRepository = {
  list() {
    return apiGet<ConversationSummary[]>("api/v1/conversations");
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
import { ApiError } from "@/lib/api/client";
import { getCurrentUser } from "@/lib/api/auth";
import type { ChatMessage, ConversationBooking, ConversationSummary } from "@/lib/api/types";
import { messagingMessages } from "@/lib/messages/messaging";
import { getMessageError } from "@/lib/validations/message";
import type { ConversationRepository } from "../conversation-repository";
import { propertyFixtures } from "./fixtures/properties";
import { defaultDetailExtras, propertyDetailExtras } from "./fixtures/property-details";

// Usuarios de prueba de lib/auth/mock-auth.ts. En el mock, todos los bienes son del arrendador de prueba.
const MOCK_TENANT_ID = "00000000-0000-4000-8000-000000000001";
const MOCK_OWNER_ID = "00000000-0000-4000-8000-000000000002";

type StoredConversation = {
  id: string;
  propertyId: string;
  tenantId: string;
  tenantName: string;
  ownerId: string;
  ownerName: string;
  booking: ConversationBooking | null;
  createdAt: string;
};

type StoredMessage = ChatMessage & { conversationId: string };

// Hilos y mensajes en memoria (se pierden al reiniciar el servidor de desarrollo).
const conversations: StoredConversation[] = [];
const messages: StoredMessage[] = [];

function ownerNameOf(propertyId: string) {
  return propertyDetailExtras[propertyId]?.ownerName ?? defaultDetailExtras.ownerName;
}

function addMessage(conversationId: string, senderId: string, content: string, createdAt: string, isRead: boolean) {
  const message: StoredMessage = {
    id: crypto.randomUUID(),
    conversationId,
    senderId,
    content,
    isRead,
    createdAt,
  };
  messages.push(message);
  return message;
}

// Conversaciones de ejemplo del arrendatario de prueba (basadas en el Figma).
function seed() {
  const playa: StoredConversation = {
    id: "conv-playa",
    propertyId: "p-03",
    tenantId: MOCK_TENANT_ID,
    tenantName: "Arrendatario Demo",
    ownerId: MOCK_OWNER_ID,
    ownerName: ownerNameOf("p-03"),
    booking: { startDate: "2026-11-12", endDate: "2026-11-14", status: "PENDIENTE" },
    createdAt: "2026-11-02T03:50:00Z",
  };
  const camara: StoredConversation = {
    id: "conv-camara",
    propertyId: "p-02",
    tenantId: MOCK_TENANT_ID,
    tenantName: "Arrendatario Demo",
    ownerId: MOCK_OWNER_ID,
    ownerName: ownerNameOf("p-02"),
    booking: null,
    createdAt: "2026-10-30T15:00:00Z",
  };
  conversations.push(playa, camara);

  addMessage(camara.id, MOCK_TENANT_ID, "¿Incluye trípode?", "2026-10-30T15:00:00Z", true);
  addMessage(camara.id, MOCK_OWNER_ID, "Sí, incluye trípode.", "2026-10-30T16:10:00Z", false);

  addMessage(playa.id, MOCK_TENANT_ID, "Hola, ya hice la reserva del 12 al 14 de noviembre. ¿A qué hora puedo llegar el 12?", "2026-11-02T03:58:00Z", true);
  addMessage(playa.id, MOCK_OWNER_ID, "¡Hola! Puedes llegar desde las 2:00 p. m. Te espero en la entrada para darte las llaves.", "2026-11-02T04:05:00Z", true);
  addMessage(playa.id, MOCK_TENANT_ID, "Perfecto, ¿hay parqueo para un carro?", "2026-11-02T04:20:00Z", false);
}
seed();

// El backend identifica al usuario por su token; aquí se usa la sesión de prueba.
async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401);
  return user;
}

// Solo el arrendatario y el arrendador del hilo pueden verlo.
function findForParticipant(conversationId: string, userId: string) {
  const conversation = conversations.find((item) => item.id === conversationId);
  if (!conversation) throw new ApiError(404, undefined, messagingMessages.notFound);
  if (conversation.tenantId !== userId && conversation.ownerId !== userId) {
    throw new ApiError(403);
  }
  return conversation;
}

function toSummary(conversation: StoredConversation, userId: string): ConversationSummary {
  const thread = messages.filter((message) => message.conversationId === conversation.id);
  const last = thread.at(-1);
  const isTenant = conversation.tenantId === userId;
  const property = propertyFixtures.find((item) => item.id === conversation.propertyId);

  return {
    id: conversation.id,
    propertyId: conversation.propertyId,
    propertyTitle: property?.title ?? "",
    otherParticipantName: isTenant ? conversation.ownerName : conversation.tenantName,
    lastMessage: last?.content ?? null,
    lastMessageAt: last?.createdAt ?? null,
    lastMessageIsMine: last?.senderId === userId,
    unreadCount: thread.filter((message) => message.senderId !== userId && !message.isRead).length,
    booking: conversation.booking,
  };
}

function toChatMessage(message: StoredMessage): ChatMessage {
  return {
    id: message.id,
    senderId: message.senderId,
    content: message.content,
    isRead: message.isRead,
    createdAt: message.createdAt,
  };
}

export const mockConversationRepository: ConversationRepository = {
  async list() {
    const user = await requireUser();
    return conversations
      .filter((item) => item.tenantId === user.id || item.ownerId === user.id)
      .map((item) => toSummary(item, user.id))
      .sort((a, b) => (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""));
  },

  async getMessages(conversationId) {
    const user = await requireUser();
    findForParticipant(conversationId, user.id);
    const thread = messages.filter((message) => message.conversationId === conversationId);
    // Al abrir el hilo, los mensajes recibidos quedan leídos.
    for (const message of thread) {
      if (message.senderId !== user.id) message.isRead = true;
    }
    return thread.map(toChatMessage);
  },

  async sendMessage(conversationId, content) {
    const user = await requireUser();
    const conversation = findForParticipant(conversationId, user.id);
    if (conversation.tenantId === conversation.ownerId) {
      throw new ApiError(409, undefined, messagingMessages.selfMessage);
    }
    const error = getMessageError(content);
    if (error) throw new ApiError(400, undefined, error);

    // El backend avisa al receptor por el servicio de notificaciones (Épica 8).
    return toChatMessage(addMessage(conversationId, user.id, content, new Date().toISOString(), false));
  },

  async startForProperty(propertyId) {
    const user = await requireUser();
    if (user.role !== "TENANT") throw new ApiError(403);

    const property = propertyFixtures.find((item) => item.id === propertyId);
    if (!property || property.status !== "DISPONIBLE") {
      throw new ApiError(404, undefined, messagingMessages.notFound);
    }
    if (user.id === MOCK_OWNER_ID) {
      throw new ApiError(409, undefined, messagingMessages.selfMessage);
    }

    const existing = conversations.find(
      (item) => item.propertyId === propertyId && item.tenantId === user.id,
    );
    if (existing) return { id: existing.id };

    const conversation: StoredConversation = {
      id: crypto.randomUUID(),
      propertyId,
      tenantId: user.id,
      tenantName: user.name ?? user.email,
      ownerId: MOCK_OWNER_ID,
      ownerName: ownerNameOf(propertyId),
      booking: null,
      createdAt: new Date().toISOString(),
    };
    conversations.push(conversation);
    return { id: conversation.id };
  },
};
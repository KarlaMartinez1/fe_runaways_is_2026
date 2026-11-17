"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import type { ChatMessage } from "@/lib/api/types";
import { messagingMessages as m } from "@/lib/messages/messaging";
import { conversationRepository } from "@/lib/repositories";
import { getMessageError } from "@/lib/validations/message";

export type SendMessageResult = { ok: true; message: ChatMessage } | { ok: false; message: string };

// Traduce los errores del backend al mensaje de la pantalla.
// Devuelve null si el error es 401 (la acción redirige a /login).
function toErrorMessage(error: unknown, fallback: string): string | null {
  if (error instanceof ApiError) {
    if (error.status === 401) return null;
    if (error.status === 403) return m.forbidden;
    if (error.status === 404) return m.notFound;
    if (error.status === 409) return m.selfMessage;
    if (error.status === 400 && error.message) return error.message;
  }
  console.error("Error de mensajería:", error);
  return fallback;
}

// H15: abre el hilo del bien desde "Preguntar al arrendador" y lleva al chat.
export async function startConversation(propertyId: string) {
  let conversationId: string;
  try {
    conversationId = (await conversationRepository.startForProperty(propertyId)).id;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 403) redirect("/access-denied");
    // Si no se pudo abrir (bien no disponible o intento de escribirse a sí mismo), se va a la bandeja.
    console.error("No se pudo abrir la conversación:", error);
    redirect("/messages");
  }
  redirect(`/messages/${encodeURIComponent(conversationId)}`);
}

// H15: envía un mensaje de 1 a 500 caracteres al hilo.
export async function sendMessage(conversationId: string, content: string): Promise<SendMessageResult> {
  const validationError = getMessageError(content);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  try {
    const message = await conversationRepository.sendMessage(conversationId, content);
    revalidatePath("/messages");
    revalidatePath(`/messages/${conversationId}`);
    return { ok: true, message };
  } catch (error) {
    const errorMessage = toErrorMessage(error, m.sendError);
    if (errorMessage === null) redirect("/login");
    return { ok: false, message: errorMessage };
  }
}
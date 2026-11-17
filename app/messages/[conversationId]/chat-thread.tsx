"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { sendMessage } from "@/app/actions/messages";
import { CharacterCounter } from "@/components/reviews/character-counter";
import { Button } from "@/components/ui";
import type { ChatMessage, ConversationSummary } from "@/lib/api/types";
import { bookingStatusLabels, messagingMessages as m } from "@/lib/messages/messaging";
import { cn } from "@/lib/utils/cn";
import { formatDateRange, formatDateTime } from "@/lib/utils/date-time";
import { getMessageError, MESSAGE_MAX } from "@/lib/validations/message";

// Cada cuánto se buscan mensajes nuevos mientras el chat está abierto.
const REFRESH_INTERVAL_MS = 15_000;

type ChatThreadProps = {
  conversation: ConversationSummary;
  messages: ChatMessage[];
  currentUserId: string;
  // Según el Figma, solo el arrendador ve el estado de la reserva en el encabezado.
  showBookingStatus: boolean;
};

// H15: hilo de conversación con los mensajes y el cuadro para escribir.
export function ChatThread({ conversation, messages, currentUserId, showBookingStatus }: ChatThreadProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string>();
  // Mensajes recién enviados que todavía no llegan en la siguiente carga del servidor.
  const [sent, setSent] = useState<ChatMessage[]>([]);
  const [isSending, startSending] = useTransition();
  const listRef = useRef<HTMLOListElement>(null);

  const loadedIds = new Set(messages.map((message) => message.id));
  const allMessages = [...messages, ...sent.filter((message) => !loadedIds.has(message.id))];

  // Busca mensajes nuevos cada cierto tiempo y al volver a la pestaña.
  useEffect(() => {
    const refresh = () => router.refresh();
    const interval = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [router]);

  // Mantiene visible el último mensaje.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [allMessages.length]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = getMessageError(content);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(undefined);
    startSending(async () => {
      const result = await sendMessage(conversation.id, content);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSent((current) => [...current, result.message]);
      setContent("");
      router.refresh();
    });
  };

  const subtitle = conversation.booking
    ? `${conversation.propertyTitle} · ${formatDateRange(conversation.booking.startDate, conversation.booking.endDate)}`
    : conversation.propertyTitle;

  return (
    <section
      aria-labelledby="chat-title"
      className="flex h-[70vh] min-h-[480px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white"
    >
      <header className="flex items-start justify-between gap-3 border-b border-zinc-200 px-5 py-4">
        <div className="min-w-0">
          <h2 id="chat-title" className="truncate font-semibold text-zinc-900">
            {conversation.otherParticipantName}
          </h2>
          <p className="truncate text-sm text-zinc-500">{subtitle}</p>
        </div>
        {showBookingStatus && conversation.booking && (
          <span className="shrink-0 rounded-md bg-[#fef3c7] px-2.5 py-0.5 text-xs font-semibold text-[#854d0e]">
            {bookingStatusLabels[conversation.booking.status]}
          </span>
        )}
      </header>

      <ol ref={listRef} className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
        {allMessages.length === 0 && (
          <li className="m-auto text-sm text-zinc-500">{m.noMessages}</li>
        )}
        {allMessages.map((message) => {
          const isMine = message.senderId === currentUserId;
          const author = isMine ? m.you : conversation.otherParticipantName;
          return (
            <li key={message.id} className={cn("flex flex-col gap-1", isMine ? "items-end" : "items-start")}>
              <p
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm sm:max-w-[70%]",
                  isMine ? "bg-[#1d4ed8] text-white" : "bg-zinc-100 text-zinc-900",
                )}
              >
                {message.content}
              </p>
              <span className="text-xs text-zinc-500">
                {m.meta(author, formatDateTime(message.createdAt))}
              </span>
            </li>
          );
        })}
      </ol>

      <form onSubmit={handleSubmit} noValidate className="border-t border-zinc-200 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="message-content" className="sr-only">
              {m.messageLabel}
            </label>
            <textarea
              id="message-content"
              rows={2}
              maxLength={MESSAGE_MAX}
              value={content}
              placeholder={m.messagePlaceholder}
              onChange={(event) => {
                setContent(event.target.value);
                setError(undefined);
              }}
              aria-invalid={Boolean(error)}
              aria-describedby="message-content-error"
              className={cn(
                "w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:ring-2",
                error
                  ? "border-red-500 focus:ring-red-100"
                  : "border-gray-300 focus:border-blue-600 focus:ring-blue-100",
              )}
            />
            <div className="flex justify-between gap-3">
              <span id="message-content-error" className="text-xs font-medium text-red-600">
                {error}
              </span>
              <CharacterCounter length={content.length} max={MESSAGE_MAX} />
            </div>
          </div>
          <Button type="submit" isLoading={isSending}>
            {isSending ? m.sending : m.send}
          </Button>
        </div>
      </form>
    </section>
  );
}
import Link from "next/link";
import type { ConversationSummary } from "@/lib/api/types";
import { messagingMessages as m } from "@/lib/messages/messaging";
import { cn } from "@/lib/utils/cn";
import { formatConversationTime } from "@/lib/utils/date-time";

type ConversationListProps = {
  conversations: ConversationSummary[];
  activeId?: string;
};

// H15: lista de conversaciones con el último mensaje y el indicador de no leído.
// La usan /messages y /messages/[conversationId].
export function ConversationList({ conversations, activeId }: ConversationListProps) {
  if (conversations.length === 0) {
    return <p className="py-10 text-center text-sm text-zinc-600">{m.emptyList}</p>;
  }

  return (
    <ul className="flex flex-col gap-1">
      {conversations.map((conversation) => {
        const isActive = conversation.id === activeId;
        const initial = conversation.otherParticipantName.trim().charAt(0).toUpperCase();

        return (
          <li key={conversation.id}>
            <Link
              href={`/messages/${encodeURIComponent(conversation.id)}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex gap-3 rounded-xl px-3 py-3 transition-colors",
                isActive ? "bg-[#EEF1FB]" : "hover:bg-zinc-50",
              )}
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DCE2F4] text-sm font-semibold text-[#2449c6]"
              >
                {initial}
              </span>

              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-semibold text-zinc-900">
                    {conversation.otherParticipantName}
                  </span>
                  {conversation.lastMessageAt && (
                    <span className="shrink-0 text-xs text-zinc-500">
                      {formatConversationTime(conversation.lastMessageAt, m.yesterday)}
                    </span>
                  )}
                </span>
                <span className="truncate text-xs text-zinc-500">{conversation.propertyTitle}</span>
                {conversation.lastMessage && (
                  <span className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "line-clamp-2 text-sm",
                        conversation.hasUnread ? "font-semibold text-zinc-900" : "text-zinc-600",
                      )}
                    >
                      {conversation.lastMessageIsMine && m.youPrefix}
                      {conversation.lastMessage}
                    </span>
                    {conversation.hasUnread && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#1d4ed8]">
                        <span className="sr-only">{m.unread}</span>
                      </span>
                    )}
                  </span>
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
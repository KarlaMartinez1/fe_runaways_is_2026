import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { ConversationList } from "@/components/messages/conversation-list";
import { getCurrentUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { ChatMessage, ConversationSummary } from "@/lib/api/types";
import { messagingMessages as m } from "@/lib/messages/messaging";
import { conversationRepository } from "@/lib/repositories";
import { ChatThread } from "./chat-thread";

export const metadata: Metadata = {
  title: "Mensajes | Runaways",
};

type ConversationPageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  // H15: mensajería del arrendatario. H16 habilita al arrendador.
  if (user.role !== "TENANT") {
    redirect("/access-denied");
  }

  const { conversationId } = await params;

  let messages: ChatMessage[] | null = null;
  let conversations: ConversationSummary[] | null = null;
  let unauthorized = false;
  let notFound = false;

  try {
    // Primero los mensajes: al leerlos quedan marcados como leídos y la lista ya sale actualizada.
    messages = await conversationRepository.getMessages(conversationId);
    conversations = await conversationRepository.list();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else if (error instanceof ApiError && error.status === 403) {
      // H15: los terceros no pueden ver el hilo.
      redirect("/access-denied");
    } else if (error instanceof ApiError && error.status === 404) {
      notFound = true;
    } else {
      console.error("Error al cargar la conversación:", error);
    }
  }

  if (unauthorized) {
    redirect("/login");
  }

  const conversation = conversations?.find((item) => item.id === conversationId);

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-6 py-10 md:px-16">
        <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* En celular solo se ve el chat; la lista queda en /messages. */}
          <section aria-labelledby="messages-title" className="hidden flex-col gap-4 lg:flex">
            <h1 id="messages-title" className="text-3xl font-bold text-zinc-900">
              {m.title}
            </h1>
            {conversations && (
              <ConversationList conversations={conversations} activeId={conversationId} />
            )}
          </section>

          <div className="flex flex-col gap-4">
            <Link
              href="/messages"
              className="inline-flex items-center gap-1 self-start text-sm text-[#2449c6] underline underline-offset-4 hover:no-underline lg:hidden"
            >
              <span aria-hidden="true">←</span>
              {m.backToList}
            </Link>

            {messages && conversation ? (
              <ChatThread
                conversation={conversation}
                messages={messages}
                currentUserId={user.id}
                // H15: solo entra el arrendatario, que no ve el estado de la reserva. H16 lo activa para el arrendador.
                showBookingStatus={false}              />            ) : (
              <p role="alert" className="py-16 text-center text-zinc-600">
                {notFound || (messages && !conversation) ? m.notFound : m.loadError}
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
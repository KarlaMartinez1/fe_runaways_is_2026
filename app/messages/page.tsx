import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { ConversationList } from "@/components/messages/conversation-list";
import { getCurrentUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { ConversationSummary } from "@/lib/api/types";
import { messagingMessages as m } from "@/lib/messages/messaging";
import { conversationRepository } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "Mensajes | Runaways",
};

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  // H15: el arrendatario pregunta. H16: el arrendador responde. El ADMIN no usa mensajería.
  if (user.role !== "TENANT" && user.role !== "OWNER") {
    redirect("/access-denied");
  }

  let conversations: ConversationSummary[] | null = null;
  let unauthorized = false;
  try {
    conversations = await conversationRepository.list();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else {
      console.error("Error al cargar las conversaciones:", error);
    }
  }

  if (unauthorized) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-6 py-10 md:px-16">
        <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <section aria-labelledby="messages-title" className="flex flex-col gap-4">
            <h1 id="messages-title" className="text-3xl font-bold text-zinc-900">
              {m.title}
            </h1>
            {conversations ? (
              <ConversationList conversations={conversations} />
            ) : (
              <p role="alert" className="py-10 text-center text-sm text-zinc-600">
                {m.loadError}
              </p>
            )}
          </section>

          {/* En escritorio, el espacio del chat invita a elegir una conversación. */}
          <div className="hidden h-[70vh] min-h-[480px] items-center justify-center rounded-2xl border border-zinc-200 bg-white text-sm text-zinc-500 lg:flex">
            {m.selectConversation}
          </div>
        </div>
      </main>
    </>
  );
}
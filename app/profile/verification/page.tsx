import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { getCurrentUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { IdentityDocumentInfo } from "@/lib/api/types";
import { identityDocumentMessages as m } from "@/lib/messages/identity-document";
import { identityDocumentRepository } from "@/lib/repositories";
import { VerificationPanel } from "./verification-panel";

export const metadata: Metadata = {
  title: "Verificación de identidad | Runaways",
};

export default async function VerificationPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  // H19: solo el arrendador y el arrendatario suben su documento.
  if (user.role === "ADMIN") {
    redirect("/access-denied");
  }

  let info: IdentityDocumentInfo | null = null;
  let unauthorized = false;
  try {
    info = await identityDocumentRepository.getMine();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else {
      console.error("Error al cargar el documento de identidad:", error);
    }
  }

  if (unauthorized) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-6 py-10 md:px-10">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">{m.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">{m.subtitle}</p>
        </div>

        {info ? (
          <VerificationPanel initialInfo={info} />
        ) : (
          <p role="alert" className="py-16 text-center text-zinc-600">
            {m.loadError}
          </p>
        )}
      </main>
    </>
  );
}
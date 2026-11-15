import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { PropertyForm } from "@/components/properties/property-form";
import { ApiError } from "@/lib/api/client";
import { propertyFormMessages as m } from "@/lib/messages/property-form";
import { profileRepository } from "@/lib/repositories";
import type { UserRole } from "@/types/models";

export const metadata: Metadata = {
  title: "Publicar bien | Runaways",
};

export default async function NewPropertyPage() {
  let role: UserRole | null = null;
  let unauthorized = false;

  try {
    role = (await profileRepository.getUserProfile()).role;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else {
      console.error("Error al cargar el perfil:", error);
    }
  }

  if (unauthorized) {
    redirect("/login");
  }
  // H1: solo el arrendador (OWNER) puede publicar bienes.
  if (role !== "OWNER") {
    redirect("/access-denied");
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-6 py-8 md:px-10">
        <Link
          href="/properties/mine"
          className="inline-flex items-center gap-1 self-start text-sm text-[#2449c6] underline underline-offset-4 hover:no-underline"
        >
          <span aria-hidden="true">←</span>
          {m.backToMine}
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{m.createTitle}</h1>
          <p className="mt-1 text-sm text-zinc-500">{m.requiredHint}</p>
        </div>

        <PropertyForm />
      </main>
    </>
  );
}
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { PropertyForm } from "@/components/properties/property-form";
import { ApiError } from "@/lib/api/client";
import type { OwnerProperty } from "@/lib/api/types";
import { detailMessages } from "@/lib/messages/properties";
import { propertyFormMessages as m } from "@/lib/messages/property-form";
import { profileRepository, propertyRepository } from "@/lib/repositories";
import type { UserRole } from "@/types/models";

export const metadata: Metadata = {
  title: "Editar bien | Runaways",
};

type EditPropertyPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;

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
  // H4: solo el arrendador (OWNER) usa esta pantalla.
  if (role !== "OWNER") {
    redirect("/access-denied");
  }

  // H4: si el bien no existe o es de otro arrendador, el repositorio devuelve null.
  let property: OwnerProperty | null = null;
  let loadFailed = false;
  try {
    property = await propertyRepository.getMine(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else if (error instanceof ApiError && error.status === 403) {
      redirect("/access-denied");
    } else {
      console.error("Error al cargar el bien:", error);
      loadFailed = true;
    }
  }

  if (unauthorized) {
    redirect("/login");
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

        {property ? (
          <>
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900">{m.editTitle}</h1>
              <p className="mt-1 text-sm text-zinc-500">{m.requiredHint}</p>
            </div>
            <PropertyForm property={property} />
          </>
        ) : (
          <p role="alert" className="py-16 text-center text-zinc-600">
            {loadFailed ? detailMessages.loadError : detailMessages.notAvailable}
          </p>
        )}
      </main>
    </>
  );
}
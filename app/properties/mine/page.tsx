import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { PropertyCard } from "@/components/properties/property-card";
import { Button } from "@/components/ui";
import { Pagination } from "@/components/ui/pagination";
import { ApiError } from "@/lib/api/client";
import type { Paginated, Property } from "@/lib/api/types";
import { myPropertiesMessages as m } from "@/lib/messages/my-properties";
import { propertyFormMessages } from "@/lib/messages/property-form";
import { profileRepository, propertyRepository } from "@/lib/repositories";
import type { UserRole } from "@/types/models";

export const metadata: Metadata = {
  title: "Mis publicaciones | Runaways",
};

type MyPropertiesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parsePage(value: string | string[] | undefined) {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

export default async function MyPropertiesPage({ searchParams }: MyPropertiesPageProps) {
  const params = await searchParams;
  const page = parsePage(params.page);
  // H1 redirige aquí con ?published=1 después de publicar con éxito.
  const justPublished = params.published === "1";

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

  let result: Paginated<Property> | null = null;
  try {
    result = await propertyRepository.listMine(page);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else if (error instanceof ApiError && error.status === 403) {
      redirect("/access-denied");
    } else {
      console.error("Error al cargar mis publicaciones:", error);
    }
  }

  if (unauthorized) {
    redirect("/login");
  }
  if (result && result.data.length === 0 && page > 1) {
    redirect("/properties/mine");
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-8 px-6 py-12 md:px-16">
        {justPublished && (
          <p role="status" className="rounded-xl bg-[#d9f5e3] px-4 py-3 text-sm font-medium text-[#14532d]">
            {propertyFormMessages.published}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-zinc-900">{m.title}</h1>
          <Button asChild>
            <Link href="/properties/new">{m.publishNew}</Link>
          </Button>
        </div>

        {!result ? (
          <p role="alert" className="py-16 text-center text-zinc-600">
            {m.loadError}
          </p>
        ) : result.data.length === 0 ? (
          <p className="py-16 text-center text-zinc-600">{m.empty}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {result.data.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  href={`/properties/${property.id}/edit`}
                  showStatus
                />
              ))}
            </div>
            <Pagination
              currentPage={result.page}
              totalPages={result.totalPages}
              basePath="/properties/mine"
            />
          </>
        )}
      </main>
    </>
  );
}
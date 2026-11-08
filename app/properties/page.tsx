import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { PropertyCard } from "@/components/properties/property-card";
import { Pagination } from "@/components/ui/pagination";
import { ApiError } from "@/lib/api/client";
import type { Paginated, Property } from "@/lib/api/types";
import { catalogMessages } from "@/lib/messages/properties";
import { propertyRepository } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "Catálogo | Runaways",
};

type CatalogPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

function parsePage(value: string | string[] | undefined) {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);

  let result: Paginated<Property> | null = null;
  let unauthorized = false;

  try {
    result = await propertyRepository.listAvailable(page);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else {
      console.error("Error al cargar el catálogo:", error);
    }
  }

  if (unauthorized) {
    redirect("/login");
  }
  if (result && result.data.length === 0 && page > 1) {
    redirect("/properties");
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-8 px-6 py-12 md:px-16">
        {!result ? (
          <p role="alert" className="py-16 text-center text-zinc-600">
            {catalogMessages.loadError}
          </p>
        ) : result.data.length === 0 ? (
          <p className="py-16 text-center text-zinc-600">{catalogMessages.empty}</p>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-8">
              {result.data.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
            <Pagination
              currentPage={result.page}
              totalPages={result.totalPages}
              basePath="/properties"
            />
          </>
        )}
      </main>
    </>
  );
}
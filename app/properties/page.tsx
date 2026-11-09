import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { PropertyCard } from "@/components/properties/property-card";
import { SearchBar } from "@/components/properties/search-bar";
import { Button } from "@/components/ui";
import { Pagination } from "@/components/ui/pagination";
import { ApiError } from "@/lib/api/client";
import type { Paginated, Property } from "@/lib/api/types";
import {
  buildPropertiesHref,
  filtersToQuery,
  parseFilters,
} from "@/lib/filters/property-filters";
import { catalogMessages } from "@/lib/messages/properties";
import { propertyRepository } from "@/lib/repositories";
import { ActiveFilters } from "./active-filters";

export const metadata: Metadata = {
  title: "Catálogo | Runaways",
};

type CatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parsePage(value: string | string[] | undefined) {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const filters = parseFilters(params);
  const query = filtersToQuery(filters);
  const hasFilters = Object.keys(query).length > 0;

  let result: Paginated<Property> | null = null;
  let unauthorized = false;

  try {
    result = await propertyRepository.listAvailable(page, filters);
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
    redirect(buildPropertiesHref(filters));
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-8 px-6 py-12 md:px-16">
        <SearchBar key={JSON.stringify(query)} filters={filters} />

        {!result ? (
          <p role="alert" className="py-16 text-center text-zinc-600">
            {hasFilters ? catalogMessages.searchError : catalogMessages.loadError}
          </p>
        ) : (
          <>
            <ActiveFilters filters={filters} total={result.total} />

            {result.data.length === 0 ? (
              hasFilters ? (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                  <p className="text-zinc-600">{catalogMessages.noResults}</p>
                  <Button asChild variant="outline">
                    <Link href="/properties">{catalogMessages.clearFilters}</Link>
                  </Button>
                </div>
              ) : (
                <p className="py-16 text-center text-zinc-600">{catalogMessages.empty}</p>
              )
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
                  query={query}
                />
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}
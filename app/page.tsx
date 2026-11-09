import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { PropertyCard } from "@/components/properties/property-card";
import { SearchBar } from "@/components/properties/search-bar";
import { ApiError } from "@/lib/api/client";
import type { Paginated, Property } from "@/lib/api/types";
import { catalogMessages, homeMessages } from "@/lib/messages/properties";
import { propertyRepository } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "Inicio | Runaways",
};

const RECENT_COUNT = 5;

export default async function Home() {
  let result: Paginated<Property> | null = null;
  let unauthorized = false;

  try {
    result = await propertyRepository.listAvailable(1);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else {
      console.error("Error al cargar los bienes recientes:", error);
    }
  }

  if (unauthorized) {
    redirect("/login");
  }

  const recent = result ? result.data.slice(0, RECENT_COUNT) : [];

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-10 px-6 py-12 md:px-16">
        <SearchBar filters={{}} showPrice={false} />

        <section className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-zinc-900">{homeMessages.recentTitle}</h1>
            <Link
              href="/properties"
              className="flex items-center gap-1 text-sm text-[#2449c6] underline underline-offset-4 hover:no-underline"
            >
              {homeMessages.viewAll}
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {!result ? (
            <p role="alert" className="py-16 text-center text-zinc-600">
              {catalogMessages.loadError}
            </p>
          ) : recent.length === 0 ? (
            <p className="py-16 text-center text-zinc-600">{catalogMessages.empty}</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-8">
              {recent.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
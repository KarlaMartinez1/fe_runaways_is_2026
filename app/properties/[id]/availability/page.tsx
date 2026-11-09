import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BlockManager } from "@/components/blocks/block-manager";
import { Navbar } from "@/components/layout/navbar";
import { ApiError } from "@/lib/api/client";
import type { NoAvailabilityBlock, PropertyAvailability } from "@/lib/api/types";
import { blockMessages } from "@/lib/messages/blocks";
import { blockRepository, propertyRepository } from "@/lib/repositories";
import { todayInElSalvador } from "@/lib/utils/dates";

export const metadata: Metadata = {
  title: "Gestionar disponibilidad | Runaways",
};

type ManageAvailabilityPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ManageAvailabilityPage({ params }: ManageAvailabilityPageProps) {
  const { id } = await params;
  const today = todayInElSalvador();

  let availability: PropertyAvailability | null = null;
  let blocks: NoAvailabilityBlock[] = [];
  let errorMessage: string | null = null;

  try {
    [availability, blocks] = await Promise.all([
      propertyRepository.getAvailability(id),
      blockRepository.listByProperty(id),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }
    if (error instanceof ApiError && error.status === 403) {
      errorMessage = blockMessages.forbidden;
    } else if (error instanceof ApiError && error.status === 404) {
      errorMessage = blockMessages.notAvailable;
    } else {
      console.error("Error al cargar los bloqueos:", error);
      errorMessage = blockMessages.loadError;
    }
  }

  if (!errorMessage && !availability) {
    errorMessage = blockMessages.notAvailable;
  }

  // Solo se muestran bloqueos cuya fecha de fin es hoy o posterior, ordenados por inicio.
  const upcomingBlocks = blocks
    .filter((block) => block.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-8 px-6 py-8 md:px-16">
        <Link
          href={`/properties/${id}`}
          className="inline-flex items-center gap-1 self-start text-sm text-[#2449c6] underline underline-offset-4 hover:no-underline"
        >
          <span aria-hidden="true">←</span>
          {blockMessages.backToProperty}
        </Link>

        <h1 className="text-3xl font-bold text-zinc-900">{blockMessages.title}</h1>

        {errorMessage && (
          <p role="alert" className="text-lg text-zinc-700">
            {errorMessage}
          </p>
        )}

        {availability && !errorMessage && (
          <BlockManager
            propertyId={id}
            from={availability.from}
            to={availability.to}
            occupiedDates={availability.occupiedDates}
            blocks={upcomingBlocks}
          />
        )}
      </main>
    </>
  );
}
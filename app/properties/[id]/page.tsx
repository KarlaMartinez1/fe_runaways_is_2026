import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { PropertyGallery } from "@/components/properties/property-gallery";
import { ApiError } from "@/lib/api/client";
import type { PropertyDetail } from "@/lib/api/types";
import { categoryLabels, detailMessages } from "@/lib/messages/properties";
import { profileRepository, propertyRepository } from "@/lib/repositories";
import { BookingBox } from "./booking-box";

export const metadata: Metadata = {
  title: "Detalle del bien | Runaways",
};

type PropertyDetailPageProps = {
  params: Promise<{ id: string }>;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

async function loadIsVerified() {
  try {
    return (await profileRepository.getAccountStatus()) === "VERIFICADA";
  } catch {
    return false;
  }
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;

  let property: PropertyDetail | null = null;
  let unauthorized = false;
  let failed = false;

  try {
    property = await propertyRepository.getById(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else {
      failed = true;
      console.error("Error al cargar el bien:", error);
    }
  }

  if (unauthorized) {
    redirect("/login");
  }

  const backLink = (
    <Link
      href="/properties"
      className="inline-flex items-center gap-1 self-start text-sm text-[#2449c6] underline underline-offset-4 hover:no-underline"
    >
      <span aria-hidden="true">←</span>
      {detailMessages.backToCatalog}
    </Link>
  );

  if (!property) {
    return (
      <>
        <Navbar />
        <main className="mx-auto flex w-full max-w-[1320px] flex-col items-center gap-4 px-6 py-24 text-center md:px-16">
          <p role="alert" className="text-lg text-zinc-700">
            {failed ? detailMessages.loadError : detailMessages.notAvailable}
          </p>
          {backLink}
        </main>
      </>
    );
  }

  const isVerified = await loadIsVerified();
  const rating = property.averageRating;
  const categoryStyle =
    property.category === "PROPIEDAD" ? "bg-[#E5EBFB] text-[#2449c6]" : "bg-[#EEF0E2] text-zinc-800";

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-8 px-6 py-8 md:px-16">
        {backLink}

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
          <section className="flex min-w-0 flex-1 flex-col gap-5">
            <PropertyGallery images={property.images} title={property.title} />

            <span className={`self-start rounded-md px-2.5 py-0.5 text-xs font-semibold ${categoryStyle}`}>
              {categoryLabels[property.category]}
            </span>

            <h1 className="text-3xl font-bold text-zinc-900">{property.title}</h1>

            <p className="text-sm text-zinc-500">
              {property.municipality}, {property.department} ·{" "}
              {rating != null && property.reviewCount > 0
                ? detailMessages.rating(rating, property.reviewCount)
                : detailMessages.noRatings}
            </p>

            <p className="text-base leading-relaxed text-zinc-800">{property.description}</p>

            <div className="flex items-center gap-3 self-start rounded-2xl border border-zinc-200 px-5 py-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E5EBFB] text-sm font-semibold text-[#2449c6]">
                {getInitials(property.ownerName)}
              </span>
              <div>
                <p className="font-semibold text-zinc-900">{property.ownerName}</p>
                <p className="text-sm text-zinc-500">{detailMessages.ownerRole}</p>
              </div>
            </div>

            {/* H9 y H10 (Módulo 3): aquí van el calendario de disponibilidad y la reserva */}
            <section id="reservar" aria-label="Disponibilidad y reserva" />
          </section>

          <aside className="w-full lg:sticky lg:top-8 lg:w-[400px]">
            <BookingBox
              pricePerDay={property.pricePerDay}
              securityDeposit={property.securityDeposit}
              isVerified={isVerified}
            />
          </aside>
        </div>
      </main>
    </>
  );
}
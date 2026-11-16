import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { RatePropertyBody } from "@/components/reviews/rate-property-body";
import { ApiError } from "@/lib/api/client";
import type { ReservationForReview } from "@/lib/api/types";
import { reviewMessages } from "@/lib/messages/reviews";
import { profileRepository, reviewRepository } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "Calificación de mi reserva | Runaways",
};

type RatePropertyPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RatePropertyPage({ params }: RatePropertyPageProps) {
  const { id } = await params;

  let reservation: ReservationForReview | null = null;
  let unauthorized = false;
  let forbidden = false;
  let failed = false;

  try {
    const profile = await profileRepository.getUserProfile();
    if (profile.role !== "TENANT") {
      forbidden = true;
    } else {
      reservation = await reviewRepository.getReservationForReview(id);
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else if (error instanceof ApiError && error.status === 403) {
      forbidden = true;
    } else {
      failed = true;
      console.error("Error al cargar la reserva para calificar:", error);
    }
  }

  if (unauthorized) redirect("/login");
  if (forbidden) redirect("/access-denied");

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-8 sm:px-6 md:px-10 lg:px-16">
        <header className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold text-[#1f2330] sm:text-3xl">
            {reviewMessages.pageTitle}
          </h1>
          <p className="text-sm text-[#5b6270] sm:text-base">{reviewMessages.pageSubtitle}</p>
        </header>

        {failed ? (
          <p role="alert" className="text-zinc-700">
            {reviewMessages.errors.loadError}
          </p>
        ) : !reservation ? (
          <p role="alert" className="text-zinc-700">
            {reviewMessages.errors.notFound}
          </p>
        ) : (
          <RatePropertyBody reservation={reservation} />
        )}
      </main>
    </>
  );
}

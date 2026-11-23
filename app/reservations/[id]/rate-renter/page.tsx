import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { RateRenterForm } from "@/components/reviews/rate-renter-form";
import { ApiError } from "@/lib/api/client";
import { getCurrentUser } from "@/lib/api/auth";
import { bookingRepository } from "@/lib/repositories";
import { reviewMessages } from "@/lib/messages/reviews";

export const metadata: Metadata = { title: "Calificar arrendatario | Runaways" };

export default async function RateRenterPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "OWNER") redirect("/access-denied");
  const { id } = await params;

  let canReview = false;
  let message: string | null = null;
  try {
    let result = await bookingRepository.listLessor({ page: 1 });
    let booking = result.data.find((item) => item.id === id);
    for (let page = 2; !booking && page <= result.totalPages; page += 1) {
      result = await bookingRepository.listLessor({ page });
      booking = result.data.find((item) => item.id === id);
    }
    if (!booking) message = reviewMessages.errors.notFound;
    else if (booking.status !== "FINALIZADA") message = reviewMessages.errors.notFinalized;
    else if (booking.hasRenterReview) message = reviewMessages.errors.alreadyReviewed;
    else canReview = true;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    if (error instanceof ApiError && error.status === 403) redirect("/access-denied");
    message = reviewMessages.errors.loadError;
  }

  return <><Navbar /><main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-10 sm:px-8"><h1 className="text-3xl font-bold text-zinc-900">Calificar arrendatario</h1><p className="text-zinc-600">Comparte cómo fue tu experiencia con esta reserva.</p>{canReview ? <RateRenterForm reservationId={id} /> : <p role="alert" className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">{message}</p>}</main></>;
}

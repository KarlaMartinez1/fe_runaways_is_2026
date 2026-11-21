import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { RateRenterForm } from "@/components/reviews/rate-renter-form";
import { getCurrentUser } from "@/lib/api/auth";

export const metadata: Metadata = { title: "Calificar arrendatario | Runaways" };

export default async function RateRenterPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "OWNER") redirect("/access-denied");
  const { id } = await params;
  return <><Navbar /><main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-10 sm:px-8"><h1 className="text-3xl font-bold text-zinc-900">Calificar arrendatario</h1><p className="text-zinc-600">Comparte cómo fue tu experiencia con esta reserva.</p><RateRenterForm reservationId={id} /></main></>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { DepositPageBody } from "@/components/deposit";
import { ApiError } from "@/lib/api/client";
import { depositRepository } from "@/lib/repositories";
import type { DepositInfo, DepositMovement } from "@/types";

export const metadata: Metadata = {
  title: "Gestión de depósito de garantía | Runaways",
  description: "Administra la devolución o retención del depósito para esta reserva.",
};

type DepositPageProps = {
  searchParams: Promise<{
    reservationId?: string;
    id?: string;
    bookingId?: string;
  }>;
};

export default async function DepositPage({ searchParams }: DepositPageProps) {
  const params = await searchParams;
  const reservationId = params.bookingId || params.reservationId || params.id;

  // Si no se especifica el ID de la reserva, redirigir al panel de reservas del arrendador
  if (!reservationId) {
    redirect("/lessor/bookings");
  }

  let unauthorized = false;
  let depositInfo: DepositInfo | null = null;
  let movements: DepositMovement[] = [];

  try {
    const [fetchedInfo, fetchedMovements] = await Promise.all([
      depositRepository.getDepositInfo(reservationId),
      depositRepository.getDepositMovements(reservationId),
    ]);

    depositInfo = fetchedInfo;
    movements = fetchedMovements;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else {
      console.error("Error al cargar la información del depósito:", error);
    }
  }

  if (unauthorized) {
    redirect("/login");
  }

  if (!depositInfo) {
    return (
      <>
        <Navbar />
        <div className="w-full flex-1 bg-[#f9fafb]">
          <main className="mx-auto flex w-full max-w-[1320px] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
            <h1 className="text-xl font-bold text-gray-900">
              Reserva no encontrada
            </h1>
            <p className="max-w-md text-sm text-gray-600">
              No se encontró información del depósito de garantía para la reserva seleccionada o no tienes permisos para gestionarla.
            </p>
            <Link
              href="/lessor/bookings"
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Volver a mis reservas
            </Link>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <DepositPageBody
        depositInfo={depositInfo}
        initialMovements={movements}
        bookingId={reservationId}
      />
    </>
  );
}

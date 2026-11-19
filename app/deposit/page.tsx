import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { DepositPageBody } from "@/components/deposit";
import { ApiError } from "@/lib/api/client";
import { bookingRepository, depositRepository } from "@/lib/repositories";
import { defaultDepositInfo } from "@/lib/repositories/mock/fixtures/deposits";
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
  let reservationId = params.bookingId || params.reservationId || params.id;

  let unauthorized = false;

  if (!reservationId) {
    try {
      const lessorBookings = await bookingRepository.listLessor({
        page: 1,
        status: "FINALIZADA",
      });
      if (lessorBookings.data && lessorBookings.data.length > 0) {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const validBooking = lessorBookings.data.find((b) => uuidRegex.test(b.id));
        reservationId = validBooking ? validBooking.id : lessorBookings.data[0].id;
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        unauthorized = true;
      }
    }
  }

  const activeId = reservationId || "res-01";
  let depositInfo: DepositInfo | null = null;
  let movements: DepositMovement[] = [];

  if (!unauthorized) {
    try {
      const [fetchedInfo, fetchedMovements] = await Promise.all([
        depositRepository.getDepositInfo(activeId),
        depositRepository.getDepositMovements(activeId),
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
  }

  if (unauthorized) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <DepositPageBody
        depositInfo={depositInfo ?? defaultDepositInfo}
        initialMovements={movements}
        bookingId={activeId}
      />
    </>
  );
}

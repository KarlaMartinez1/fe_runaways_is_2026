import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { PaymentPageBody } from '@/components/payment/payment-page-body';
import { ApiError } from '@/lib/api/client';
import { bookingRepository, reservationRepository } from '@/lib/repositories';
import { paymentFormMessages } from '@/lib/messages/payment';

export const metadata: Metadata = {
  title: 'Pagar reserva | Runaways',
  description: 'Detalles de la reserva y confirmación de método de pago.',
};

type PaymentPageProps = {
  searchParams: Promise<{
    reservationId?: string;
    id?: string;
    bookingId?: string;
  }>;
};

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const params = await searchParams;
  let reservationId = params.bookingId || params.reservationId || params.id;

  let reservation = null;
  let unauthorized = false;

  // Si no se proporcionó un ID en los parámetros de la URL, buscamos si hay reservas pendientes
  if (!reservationId) {
    try {
      const myBookings = await bookingRepository.listMine({ page: 1, status: 'PENDIENTE' });
      if (myBookings.data && myBookings.data.length > 0) {
        reservationId = myBookings.data[0].id;
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        unauthorized = true;
      }
    }
  }

  // Si tenemos un ID de reserva, cargamos su detalle
  if (reservationId && !unauthorized) {
    try {
      reservation = await reservationRepository.getReservationById(reservationId);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        unauthorized = true;
      } else {
        console.error('Error al cargar la reserva:', error);
      }
    }
  }

  if (unauthorized) {
    redirect('/login');
  }

  // Si después de buscar no hay ninguna reserva que pagar
  if (!reservation && !reservationId) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6 text-center">
          <div className="max-w-md rounded-2xl bg-white p-8 shadow-xs border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {paymentFormMessages.emptyPendingBookings}
            </h2>
            <p className="text-sm text-gray-600 mb-5">
              {paymentFormMessages.missingBooking}
            </p>
            <Link
              href="/bookings/mine"
              className="inline-flex rounded-xl bg-[#1E4DB7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163c91]"
            >
              {paymentFormMessages.viewMyBookings}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <PaymentPageBody
        reservation={reservation ?? undefined}
        bookingId={reservationId}
      />
    </>
  );
}

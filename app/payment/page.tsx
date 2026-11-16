import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { PaymentPageBody } from '@/components/payment/payment-page-body';
import { ApiError } from '@/lib/api/client';
import { reservationRepository } from '@/lib/repositories';

export const metadata: Metadata = {
  title: 'Pagar reserva | Runaways',
  description: 'Detalles de la reserva y confirmación de método de pago.',
};

type PaymentPageProps = {
  searchParams: Promise<{ reservationId?: string; id?: string }>;
};

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const params = await searchParams;
  const reservationId = params.reservationId || params.id || 'res-01';

  let reservation = null;
  let unauthorized = false;

  try {
    reservation = await reservationRepository.getReservationById(reservationId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else {
      console.error('Error al cargar la reserva:', error);
    }
  }

  if (unauthorized) {
    redirect('/login');
  }

  return (
    <>
      <Navbar />
      <PaymentPageBody reservation={reservation ?? undefined} />
    </>
  );
}

import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { ReservationHistoryPageBody } from '@/components/reservation-history';

export const metadata: Metadata = {
  title: 'Historial y recibos de pago | Runaways',
  description: 'Comprobante de transacción e historial de movimientos de la reserva.',
};

export default function ReceiptPage() {
  return (
    <>
      <Navbar />
      <ReservationHistoryPageBody />
    </>
  );
}

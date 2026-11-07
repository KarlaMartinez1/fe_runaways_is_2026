import type { Metadata } from 'next';
import { ReservationHistoryPageBody } from '@/components/features/reservation-history';

export const metadata: Metadata = {
  title: 'Comprobante de reserva | Runaways',
  description: 'Comprobante de transacción y movimientos de la reserva.',
};

export default function ReceiptPage() {
  return <ReservationHistoryPageBody />;
}

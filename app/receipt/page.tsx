import type { Metadata } from 'next';
import { ReservationHistoryPageBody } from '@/components/features/reservation-history';

export const metadata: Metadata = {
  title: 'Historial de movimientos y recibos de pago | Runaways',
  description: 'Comprobante de transacción e historial de movimientos de la reserva.',
};

export default function ReceiptPage() {
  return <ReservationHistoryPageBody />;
}

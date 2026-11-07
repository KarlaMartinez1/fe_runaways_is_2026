import type { Metadata } from 'next';
import { ReservationHistoryPageBody } from '@/components/features/reservation-history';

export const metadata: Metadata = {
  title: 'Historial de movimientos y recibos de pago | Runaways',
  description: 'Historial de movimientos de la reserva y comprobantes de pago detallados.',
};

export default function HistorialMovimientosPage() {
  return <ReservationHistoryPageBody />;
}

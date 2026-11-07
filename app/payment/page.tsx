import type { Metadata } from 'next';
import { PaymentPageBody } from '@/components/features/payment';

export const metadata: Metadata = {
  title: 'Pagar reserva | Runaways',
  description: 'Detalles de la reserva y confirmación de método de pago.',
};

export default function PaymentPage() {
  return <PaymentPageBody />;
}

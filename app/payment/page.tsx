import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { PaymentPageBody } from '@/components/payment/payment-page-body';

export const metadata: Metadata = {
  title: 'Pagar reserva | Runaways',
  description: 'Detalles de la reserva y confirmación de método de pago.',
};

export default function PaymentPage() {
  return (
    <>
      <Navbar />
      <PaymentPageBody />
    </>
  );
}


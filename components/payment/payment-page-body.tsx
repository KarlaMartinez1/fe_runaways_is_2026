import * as React from 'react';
import { Heading } from '@/components/ui/heading';
import { cn } from '@/lib/utils/cn';
import { ReservationSummary } from '@/components/payment/reservation-summary';
import { PaymentMethodForm } from '@/components/payment/payment-method-form';
import type { ReservationDetail } from '@/types';

export interface PaymentPageBodyProps {
  reservation?: ReservationDetail;
  className?: string;
}

export function PaymentPageBody({
  reservation,
  className,
}: PaymentPageBodyProps) {
  return (
    <main className={cn('w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10', className)}>
      <div className="mb-6 sm:mb-8">
        <Heading
          as="h1"
          size="2xl"
          subtitle="Acá encontrarás los detalles de tu reserva."
          className="text-gray-950 font-extrabold tracking-tight text-2xl sm:text-3xl"
        >
          Pagar reserva
        </Heading>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        <ReservationSummary reservation={reservation} className="w-full" />
        <PaymentMethodForm />
      </div>
    </main>
  );
}

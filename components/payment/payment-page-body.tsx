import * as React from 'react';
import { Heading } from '@/components/ui/heading';
import { cn } from '@/lib/utils/cn';
import { ReservationSummary } from '@/components/payment/reservation-summary';
import { PaymentMethodForm } from '@/components/payment/payment-method-form';
import { paymentMessages } from '@/lib/messages/payment';
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
    <div className="w-full flex-1 bg-[#f9fafb]">
      <main
        className={cn(
          'mx-auto flex w-full max-w-[1320px] flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 md:px-16',
          className
        )}
      >
        <div>
          <Heading
            as="h1"
            size="2xl"
            subtitle={paymentMessages.pageSubtitle}
            className="text-gray-950 font-extrabold tracking-tight text-2xl sm:text-3xl"
          >
            {paymentMessages.pageTitle}
          </Heading>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-5 lg:gap-8 items-start">
          <ReservationSummary reservation={reservation} className="w-full" />
          <PaymentMethodForm className="w-full" />
        </div>
      </main>
    </div>
  );
}

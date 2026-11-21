'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Heading } from '@/components/ui/heading';
import { cn } from '@/lib/utils/cn';
import { receiptMessages } from '@/lib/messages/receipt';
import { ReservationMovementsTable } from './reservation-movements-table';
import { ReservationReceiptCard } from './reservation-receipt-card';
import type { PaymentReceiptDetail, ReservationMovement } from '@/types';

export interface ReservationHistoryPageBodyProps {
  initialMovements?: ReservationMovement[];
  initialReceipt?: PaymentReceiptDetail;
  receiptsMap?: Record<string, PaymentReceiptDetail>;
  className?: string;
}

export function ReservationHistoryPageBody({
  initialMovements = [],
  initialReceipt,
  receiptsMap = {},
  className,
}: ReservationHistoryPageBodyProps) {
  const router = useRouter();
  const [selectedReceipt, setSelectedReceipt] =
    React.useState<PaymentReceiptDetail | null>(initialReceipt ?? null);

  const handleSelectMovement = (movement: ReservationMovement) => {
    if (movement.receiptId && receiptsMap[movement.receiptId]) {
      setSelectedReceipt(receiptsMap[movement.receiptId]);
    } else if (movement.receiptId && selectedReceipt?.id === movement.receiptId) {
      // ya está seleccionado
    } else {
      setSelectedReceipt({
        id: movement.receiptId || `trx-${movement.id}`,
        status: movement.type === 'COBRO' ? 'Pagada' : 'Devuelta',
        itemTitle: selectedReceipt?.itemTitle || 'Reserva de bien',
        rentalDateRange: selectedReceipt?.rentalDateRange || '',
        daysCount: selectedReceipt?.daysCount || 1,
        transactionNumber: `TRX-${movement.id.toUpperCase()}`,
        paymentDateTime: movement.date,
        rentalSubtotal: movement.type === 'COBRO' ? movement.amount : 0.0,
        securityDeposit: 0.0,
        totalPaid: movement.amount,
        paymentMethod: selectedReceipt?.paymentMethod || 'Tarjeta registrada',
      });
    }
  };

  const handleBackToReservations = () => {
    router.push('/properties');
  };

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
            subtitle={receiptMessages.pageSubtitle}
            className="text-gray-950 font-extrabold tracking-tight text-2xl sm:text-3xl"
          >
            {receiptMessages.pageTitle}
          </Heading>
        </div>

        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:gap-y-3 items-start">
          {/* Section heading above left column */}
          <div className="w-full lg:col-span-7">
            <h2
              id="movements-heading"
              className="text-base sm:text-lg font-bold text-gray-950 tracking-tight"
            >
              {receiptMessages.movementsTitle}
            </h2>
          </div>

          <div className="hidden lg:block lg:col-span-5" aria-hidden="true" />

          <section
            aria-labelledby="movements-heading"
            className="w-full lg:col-span-7"
          >
            <ReservationMovementsTable
              movements={initialMovements}
              selectedReceiptId={selectedReceipt?.id}
              onSelectReceipt={handleSelectMovement}
            />
          </section>

          {/* Right card: receipt details */}
          <section
            aria-label="Comprobante de pago seleccionado"
            className="w-full lg:col-span-5"
          >
            {selectedReceipt && (
              <ReservationReceiptCard
                receipt={selectedReceipt}
                onBackToReservations={handleBackToReservations}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

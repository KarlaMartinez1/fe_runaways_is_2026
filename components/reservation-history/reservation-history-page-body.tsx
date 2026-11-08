'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Heading } from '@/components/ui/heading';
import { cn } from '@/lib/utils/cn';
import { ReservationMovementsTable } from './reservation-movements-table';
import { ReservationReceiptCard } from './reservation-receipt-card';
import type { PaymentReceiptDetail, ReservationMovement } from '@/types';

export interface ReservationHistoryPageBodyProps {
  initialMovements?: ReservationMovement[];
  initialReceipt?: PaymentReceiptDetail;
  className?: string;
}

const defaultMovements: ReservationMovement[] = [
  {
    id: 'mov-1',
    date: '10/11/2026 10:05 AM',
    type: 'COBRO',
    amount: 95.0,
    reason: 'Pago de reserva exitoso',
    receiptId: 'trx-1',
  },
  {
    id: 'mov-2',
    date: '12/11/2026 11:30 AM',
    type: 'DEVOLUCIÓN',
    amount: 50.0,
    reason: 'Devolución automática de depósito',
    receiptId: 'trx-2',
  },
];

const defaultReceipts: Record<string, PaymentReceiptDetail> = {
  'trx-1': {
    id: 'trx-1',
    status: 'Pagada',
    itemTitle: 'Alquiler de espacio de oficina',
    rentalDateRange: 'Del 10/11/2026 al 12/11/2026',
    daysCount: 3,
    transactionNumber: 'TRX-8f9a2b1c',
    paymentDateTime: '10/11/2026 10:05 AM',
    rentalSubtotal: 45.0,
    securityDeposit: 50.0,
    totalPaid: 95.0,
    paymentMethod: 'Visa terminada en 4242',
  },
  'trx-2': {
    id: 'trx-2',
    status: 'Devuelta',
    itemTitle: 'Alquiler de espacio de oficina',
    rentalDateRange: 'Del 10/11/2026 al 12/11/2026',
    daysCount: 3,
    transactionNumber: 'TRX-4a2b6e8f',
    paymentDateTime: '12/11/2026 11:30 AM',
    rentalSubtotal: 0.0,
    securityDeposit: 50.0,
    totalPaid: 50.0,
    paymentMethod: 'Visa terminada en 4242',
  },
};

export function ReservationHistoryPageBody({
  initialMovements = defaultMovements,
  initialReceipt = defaultReceipts['trx-1'],
  className,
}: ReservationHistoryPageBodyProps) {
  const router = useRouter();
  const [selectedReceipt, setSelectedReceipt] =
    React.useState<PaymentReceiptDetail>(initialReceipt);

  const handleSelectMovement = (movement: ReservationMovement) => {
    const matchedReceipt = movement.receiptId ? defaultReceipts[movement.receiptId] : null;
    if (matchedReceipt) {
      setSelectedReceipt(matchedReceipt);
    } else {
      setSelectedReceipt({
        status: movement.type === 'COBRO' ? 'Pagada' : 'Devuelta',
        itemTitle: 'Alquiler de espacio de oficina',
        rentalDateRange: 'Del 10/11/2026 al 12/11/2026',
        daysCount: 3,
        transactionNumber: `TRX-${movement.id.toUpperCase()}`,
        paymentDateTime: movement.date,
        rentalSubtotal: movement.type === 'COBRO' ? 45.0 : 0.0,
        securityDeposit: movement.type === 'COBRO' ? 50.0 : movement.amount,
        totalPaid: movement.amount,
        paymentMethod: 'Visa terminada en 4242',
      });
    }
  };

  const handleBackToReservations = () => {
    router.push('/');
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
            subtitle="Acá encontrarás el comprobante de tu transacción y el registro de tu historial."
            className="text-gray-950 font-extrabold tracking-tight text-2xl sm:text-3xl"
          >
            Historial y recibos de pago
          </Heading>
        </div>

        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:gap-y-3 items-start">
          {/* Section heading above left column */}
          <div className="w-full lg:col-span-7">
            <h2
              id="movements-heading"
              className="text-base sm:text-lg font-bold text-gray-950 tracking-tight"
            >
              Historial de movimientos de la reserva
            </h2>
          </div>

          {/* Spacer to align left and right cards on the same horizontal line in desktop */}
          <div className="hidden lg:block lg:col-span-5" aria-hidden="true" />

          {/* Left card: movements table (desktop) / cards (mobile) */}
          <section
            aria-labelledby="movements-heading"
            className="w-full lg:col-span-7"
          >
            <ReservationMovementsTable
              movements={initialMovements}
              selectedReceiptId={selectedReceipt.id}
              onSelectReceipt={handleSelectMovement}
            />
          </section>

          {/* Right card: receipt details */}
          <section
            aria-label="Comprobante de pago seleccionado"
            className="w-full lg:col-span-5"
          >
            <ReservationReceiptCard
              receipt={selectedReceipt}
              onBackToReservations={handleBackToReservations}
            />
          </section>
        </div>
      </main>
    </div>
  );
}

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Heading } from '@/components/ui';
import { ReservationMovementsTable } from './ReservationMovementsTable';
import { ReservationReceiptCard } from './ReservationReceiptCard';
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
    <main className={`w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 ${className || ''}`}>
      <header className="mb-6 sm:mb-8">
        <Heading
          as="h1"
          size="2xl"
          subtitle="Acá encontrarás el comprobante de tu transacción y el registro de tu historial."
          className="text-gray-950 font-extrabold tracking-tight text-2xl sm:text-3xl"
        >
          Historial de movimientos y recibos de pago
        </Heading>
      </header>

      <Card padding="lg" className="bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl shadow-xs space-y-8 sm:space-y-10">
        <section aria-labelledby="movements-heading" className="space-y-4">
          <h2
            id="movements-heading"
            className="text-center text-lg sm:text-xl font-bold text-gray-900 tracking-tight"
          >
            Historial de movimientos de la reserva
          </h2>
          <ReservationMovementsTable
            movements={initialMovements}
            selectedReceiptId={selectedReceipt.id}
            onSelectReceipt={handleSelectMovement}
          />
        </section>

        <section aria-label="Comprobante de pago seleccionado">
          <ReservationReceiptCard
            receipt={selectedReceipt}
            onBackToReservations={handleBackToReservations}
          />
        </section>
      </Card>
    </main>
  );
}

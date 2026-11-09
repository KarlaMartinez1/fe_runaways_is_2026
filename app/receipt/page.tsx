import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { ReservationHistoryPageBody } from '@/components/reservation-history';
import { ApiError } from '@/lib/api/client';
import { reservationRepository } from '@/lib/repositories';
import type { PaymentReceiptDetail, ReservationMovement } from '@/types';

export const metadata: Metadata = {
  title: 'Historial y recibos de pago | Runaways',
  description: 'Comprobante de transacción e historial de movimientos de la reserva.',
};

type ReceiptPageProps = {
  searchParams: Promise<{ reservationId?: string; receiptId?: string }>;
};

export default async function ReceiptPage({ searchParams }: ReceiptPageProps) {
  const params = await searchParams;
  const reservationId = params.reservationId || 'default';
  const receiptId = params.receiptId || 'trx-1';

  let movements: ReservationMovement[] = [];
  let initialReceipt: PaymentReceiptDetail | null = null;
  const receiptsMap: Record<string, PaymentReceiptDetail> = {};
  let unauthorized = false;

  try {
    const [fetchedMovements, fetchedReceipt] = await Promise.all([
      reservationRepository.getMovements(reservationId),
      reservationRepository.getReceiptById(receiptId),
    ]);

    movements = fetchedMovements;
    initialReceipt = fetchedReceipt;

    if (initialReceipt && initialReceipt.id) {
      receiptsMap[initialReceipt.id] = initialReceipt;
    }

    // Pre-cargar recibos referenciados en los movimientos para navegación fluida
    const otherReceiptIds = movements
      .map((m) => m.receiptId)
      .filter((id): id is string => Boolean(id && id !== receiptId));

    await Promise.all(
      otherReceiptIds.map(async (id) => {
        const r = await reservationRepository.getReceiptById(id);
        if (r && r.id) {
          receiptsMap[r.id] = r;
        }
      })
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else {
      console.error('Error al cargar movimientos o recibo:', error);
    }
  }

  if (unauthorized) {
    redirect('/login');
  }

  return (
    <>
      <Navbar />
      <ReservationHistoryPageBody
        initialMovements={movements}
        initialReceipt={initialReceipt ?? undefined}
        receiptsMap={receiptsMap}
      />
    </>
  );
}

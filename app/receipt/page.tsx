import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { ReservationHistoryPageBody } from '@/components/reservation-history';
import { ApiError } from '@/lib/api/client';
import { reservationRepository } from '@/lib/repositories';
import type { PaymentReceiptDetail, ReservationMovement } from '@/types';

export const metadata: Metadata = {
  title: 'Historial de movimientos y recibos de pago | Runaways',
  description: 'Acá encontraras el comprobante de tu transaccion y el registro de tu historial',
};

type ReceiptPageProps = {
  searchParams: Promise<{
    reservationId?: string;
    bookingId?: string;
    receiptId?: string;
    receiptNumber?: string;
    title?: string;
    start?: string;
    end?: string;
    days?: string;
    subtotal?: string;
    deposit?: string;
    total?: string;
    last4?: string;
    date?: string;
  }>;
};

export default async function ReceiptPage({ searchParams }: ReceiptPageProps) {
  const params = await searchParams;
  const reservationId = params.bookingId || params.reservationId || 'default';
  const receiptId = params.receiptNumber || params.receiptId || 'trx-1';

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

  // Si no se encontró un recibo en el repositorio (ej. no hay tabla de recibos estática),
  // pero vinieron datos del comprobante generado por el backend tras el pago:
  if (!initialReceipt && (params.receiptId || params.receiptNumber || params.total)) {
    const transactionNum = params.receiptNumber || params.receiptId || 'PAY-CONFIRMED';
    const formattedDate = params.date
      ? new Date(params.date).toLocaleString('es-SV', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'America/El_Salvador',
        })
      : new Date().toLocaleString('es-SV', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'America/El_Salvador',
        });

    initialReceipt = {
      id: transactionNum,
      status: 'Pagada',
      itemTitle: params.title || 'Reserva de bien',
      rentalDateRange:
        params.start && params.end ? `Del ${params.start} al ${params.end}` : '',
      daysCount: Number(params.days) || 1,
      transactionNumber: transactionNum,
      paymentDateTime: formattedDate,
      rentalSubtotal: parseFloat(params.subtotal || '0'),
      securityDeposit: parseFloat(params.deposit || '0'),
      totalPaid: parseFloat(params.total || '0'),
      paymentMethod: params.last4
        ? `Tarjeta terminada en ${params.last4}`
        : 'Tarjeta de crédito/débito',
    };

    receiptsMap[transactionNum] = initialReceipt;
  }

  // Si aún no hay movimientos en la tabla pero tenemos el recibo de cobro inicial
  if (movements.length === 0 && initialReceipt) {
    movements = [
      {
        id: initialReceipt.transactionNumber,
        date: initialReceipt.paymentDateTime,
        type: 'COBRO',
        amount: initialReceipt.totalPaid,
        reason: 'Cobro del alquiler y depósito de garantía.',
        receiptId: initialReceipt.id,
      },
    ];
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

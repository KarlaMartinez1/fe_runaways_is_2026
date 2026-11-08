import * as React from 'react';
import { Badge, Button } from '@/components/ui';
import type { PaymentReceiptDetail } from '@/types';

export interface ReservationReceiptCardProps {
  receipt: PaymentReceiptDetail;
  onBackToReservations?: () => void;
  className?: string;
}

export function ReservationReceiptCard({
  receipt,
  onBackToReservations,
  className,
}: ReservationReceiptCardProps) {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const getStatusBadgeVariant = (status: PaymentReceiptDetail['status']) => {
    switch (status) {
      case 'Pagada':
        return 'success';
      case 'Devuelta':
        return 'info';
      case 'Retenida':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <article
      className={`w-full rounded-2xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4 sm:space-y-5 ${className || ''}`}
      aria-label="Recibo de pago de reserva"
    >
      <header className="flex items-center justify-between gap-4">
        <h2 className="text-base sm:text-lg font-bold text-gray-950 tracking-tight">
          Recibo de pago de reserva
        </h2>
        <Badge variant={getStatusBadgeVariant(receipt.status)} size="sm" className="px-2.5 py-0.5">
          {receipt.status}
        </Badge>
      </header>

      <section className="space-y-2.5 text-sm" aria-label="Detalles de la transacción">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-normal">Título del bien</span>
          <span className="text-gray-950 font-bold text-right">{receipt.itemTitle}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-normal">Fecha de renta</span>
          <span className="text-gray-950 font-bold text-right">{receipt.rentalDateRange}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-normal">Cantidad de días</span>
          <span className="text-gray-950 font-bold text-right">
            {receipt.daysCount} {receipt.daysCount === 1 ? 'día' : 'días'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-normal">N.º de transacción</span>
          <span className="text-gray-950 font-bold font-mono text-right">
            {receipt.transactionNumber}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-normal">Fecha y hora de pago</span>
          <span className="text-gray-950 font-bold text-right">{receipt.paymentDateTime}</span>
        </div>
      </section>

      <div className="rounded-xl bg-[#f8fafc] p-3.5 sm:p-4 space-y-2 border border-gray-100">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 font-normal">Subtotal de alquiler</span>
          <span className="text-gray-950 font-bold">
            {formatCurrency(receipt.rentalSubtotal)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 font-normal">Depósito de garantía</span>
          <span className="text-gray-950 font-bold">
            {formatCurrency(receipt.securityDeposit)}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-baseline pt-0.5">
        <span className="text-xl font-bold text-gray-950">Total pagado</span>
        <span className="text-xl font-extrabold text-gray-950">
          {formatCurrency(receipt.totalPaid)}
        </span>
      </div>

      <div className="flex justify-between items-center text-sm py-0.5">
        <span className="text-gray-500 font-normal">Tarjeta utilizada</span>
        <span className="text-gray-950 font-bold text-right">{receipt.paymentMethod}</span>
      </div>

      <div className="pt-2">
        <Button
          type="button"
          variant="solid"
          size="md"
          onClick={onBackToReservations}
          className="w-full bg-[#1d4ed8] hover:bg-blue-800 text-white font-medium py-3 rounded-xl shadow-xs"
        >
          Volver a Mis reservas
        </Button>
      </div>
    </article>
  );
}

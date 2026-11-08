import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { ReservationDetail } from '@/types';

export interface ReservationSummaryProps {
  reservation?: ReservationDetail;
  className?: string;
}

const defaultReservation: ReservationDetail = {
  itemTitle: ' ',
  startDate: ' ',
  endDate: ' ',
  daysCount: 0,
  subtotal: 0.0,
  securityDeposit: 0.0,
  total: 0.0,
  dueDate: ' ',
  isReadOnly: true,
};

export function ReservationSummary({
  reservation = defaultReservation,
  className,
}: ReservationSummaryProps) {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const formatRentalDateRange = (startDate: string | Date, endDate: string | Date) => {
    const startStr =
      startDate instanceof Date
        ? startDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : startDate?.toString().trim();

    const endStr =
      endDate instanceof Date
        ? endDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : endDate?.toString().trim();

    if (!startStr && !endStr) return '';
    return `Del ${startStr} al ${endStr}`;
  };

  return (
    <Card padding="md" className={className}>
      <CardHeader>
        <CardTitle as="h2" className="text-lg sm:text-xl font-bold">
          Resumen de la reserva
        </CardTitle>
        {reservation.isReadOnly && (
          <span className="bg-[#e8efff] text-[#2563eb] text-xs font-semibold px-2.5 py-0.5 rounded-full select-none">
            Solo lectura
          </span>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between items-center text-sm py-0.5">
          <span className="text-gray-500 font-normal">Título del bien</span>
          <span className="text-gray-950 font-bold text-right">{reservation.itemTitle}</span>
        </div>

        <div className="flex justify-between items-center text-sm py-0.5">
          <span className="text-gray-500 font-normal">Fecha de renta</span>
          <span className="text-gray-950 font-bold text-right">
            {formatRentalDateRange(reservation.startDate, reservation.endDate)}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm py-0.5">
          <span className="text-gray-500 font-normal">Cantidad de días</span>
          <span className="text-gray-950 font-bold text-right">
            {reservation.daysCount} {reservation.daysCount === 1 ? 'día' : 'días'}
          </span>
        </div>

        <div className="rounded-xl bg-[#f8fafc] p-4 sm:p-5 space-y-3 border border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 font-normal">Subtotal de alquiler</span>
            <span className="text-gray-950 font-bold">{formatCurrency(reservation.subtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 font-normal">Depósito de garantía</span>
            <span className="text-gray-950 font-bold">{formatCurrency(reservation.securityDeposit)}</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
          <span className="text-xl sm:text-2xl font-bold text-gray-950">Total a pagar</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-950">
            {formatCurrency(reservation.total)}
          </span>
        </div>

        <p className="text-xs text-gray-400">
          Total = costo del alquiler + depósito de garantía
        </p>

        <div className="rounded-xl bg-[#edf4e8] border border-[#dbe6d3] px-4 py-3 text-sm text-[#3b592d] font-medium flex items-center gap-2">
          <span>Pagar antes de: {reservation.dueDate}</span>
        </div>
      </CardContent>
    </Card>
  );
}

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { paymentMessages } from '@/lib/messages/payment';
import type { ReservationDetail } from '@/types';

export interface ReservationSummaryProps {
  reservation?: ReservationDetail;
  className?: string;
}

export function ReservationSummary({
  reservation,
  className,
}: ReservationSummaryProps) {
  if (!reservation) {
    return null;
  }

  return (
    <Card padding="md" className={className}>
      <CardHeader>
        <CardTitle as="h2" className="text-lg sm:text-xl font-bold">
          {paymentMessages.summaryTitle}
        </CardTitle>
        {reservation.isReadOnly && (
          <span className="bg-[#e8efff] text-[#2563eb] text-xs font-semibold px-2.5 py-0.5 rounded-full select-none">
            {paymentMessages.readOnlyBadge}
          </span>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between items-center text-sm py-0.5">
          <span className="text-gray-500 font-normal">
            {paymentMessages.itemTitleLabel}
          </span>
          <span className="text-gray-950 font-bold text-right">
            {reservation.itemTitle}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm py-0.5">
          <span className="text-gray-500 font-normal">
            {paymentMessages.rentalDateLabel}
          </span>
          <span className="text-gray-950 font-bold text-right">
            {paymentMessages.formatRentalDateRange(
              reservation.startDate,
              reservation.endDate
            )}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm py-0.5">
          <span className="text-gray-500 font-normal">
            {paymentMessages.daysCountLabel}
          </span>
          <span className="text-gray-950 font-bold text-right">
            {paymentMessages.daysText(reservation.daysCount)}
          </span>
        </div>

        <div className="rounded-xl bg-[#f8fafc] p-4 sm:p-5 space-y-3 border border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 font-normal">
              {paymentMessages.subtotalLabel}
            </span>
            <span className="text-gray-950 font-bold">
              {paymentMessages.formatCurrency(reservation.subtotal)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 font-normal">
              {paymentMessages.depositLabel}
            </span>
            <span className="text-gray-950 font-bold">
              {paymentMessages.formatCurrency(reservation.securityDeposit)}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
          <span className="text-xl sm:text-2xl font-bold text-gray-950">
            {paymentMessages.totalLabel}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-950">
            {paymentMessages.formatCurrency(reservation.total)}
          </span>
        </div>

        <p className="text-xs text-gray-400">{paymentMessages.formulaNote}</p>

        {reservation.dueDate && (
          <div className="rounded-xl bg-[#edf4e8] border border-[#dbe6d3] px-4 py-3 text-sm text-[#3b592d] font-medium flex items-center gap-2">
            <span>{paymentMessages.dueNotice(reservation.dueDate)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

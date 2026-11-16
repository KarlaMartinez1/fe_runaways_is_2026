import * as React from 'react';
import { Table } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import {
  depositMessages,
  depositMovementHeaders,
} from '@/lib/messages/deposit';
import type { DepositMovement } from '@/types';

export interface DepositMovementsTableProps {
  movements: DepositMovement[];
  className?: string;
}

export function DepositMovementsTable({
  movements,
  className,
}: DepositMovementsTableProps) {
  const getTypeStyle = (type: DepositMovement['type']) => {
    switch (type) {
      case 'COBRO':
        return 'text-emerald-700 font-bold';
      case 'DEVOLUCIÓN':
        return 'text-blue-600 font-bold';
      case 'RETENCIÓN':
        return 'text-amber-700 font-bold';
      default:
        return 'text-zinc-700 font-bold';
    }
  };

  const rows = movements.map((movement) => [
    <span key="date" className="text-zinc-800 font-normal">
      {movement.date}
    </span>,
    <span
      key="type"
      className={cn('tracking-wide text-xs sm:text-sm', getTypeStyle(movement.type))}
    >
      {movement.type}
    </span>,
    <span key="amount" className="font-bold text-gray-950">
      {depositMessages.formatCurrency(movement.amount)}
    </span>,
    <span key="reason" className="text-zinc-600">
      {movement.reason}
    </span>,
    <span key="details" className="text-[#1E4DB7] font-semibold text-sm">
      {movement.details}
    </span>,
  ]);

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile view: stacked compact cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {movements.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
            {depositMessages.emptyMovements}
          </div>
        ) : (
          movements.map((movement) => (
            <article
              key={movement.id}
              className="rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-1.5"
              aria-label={`Movimiento ${movement.type} por ${depositMessages.formatCurrency(movement.amount)}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'text-sm tracking-wide font-bold',
                    getTypeStyle(movement.type)
                  )}
                >
                  {movement.type}
                </span>
                <span className="text-base font-bold text-gray-950">
                  {depositMessages.formatCurrency(movement.amount)}
                </span>
              </div>

              <p className="text-sm text-zinc-900 font-normal">
                {movement.reason}
              </p>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-zinc-500">{movement.date}</span>
                <span className="text-[#1E4DB7] font-semibold">
                  {movement.details}
                </span>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Desktop view: wide table inside card container */}
      <div className="hidden md:block rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <Table
          headers={depositMovementHeaders}
          rows={rows}
          hoverable
          emptyMessage={depositMessages.emptyMovements}
        />
      </div>
    </div>
  );
}

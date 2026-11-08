import * as React from 'react';
import { Table } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import type { ReservationMovement } from '@/types';

export interface ReservationMovementsTableProps {
  movements: ReservationMovement[];
  selectedReceiptId?: string;
  onSelectReceipt?: (movement: ReservationMovement) => void;
  className?: string;
}

export function ReservationMovementsTable({
  movements,
  selectedReceiptId,
  onSelectReceipt,
  className,
}: ReservationMovementsTableProps) {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const getTypeStyle = (type: ReservationMovement['type']) => {
    switch (type) {
      case 'COBRO':
        return 'text-emerald-700 font-bold';
      case 'DEVOLUCIÓN':
        return 'text-blue-600 font-bold';
      case 'RETENCIÓN':
        return 'text-amber-700 font-bold';
      default:
        return 'text-gray-700 font-bold';
    }
  };

  const renderTypeCell = (type: ReservationMovement['type']) => {
    return <span className={cn('tracking-wide', getTypeStyle(type))}>{type}</span>;
  };

  const headers = ['Fecha', 'Tipo', 'Monto', 'Motivo', ''];

  const rows = movements.map((movement) => {
    const isSelected = Boolean(selectedReceiptId && movement.receiptId === selectedReceiptId);

    return [
      <span key="date" className="text-gray-800 font-normal">
        {movement.date}
      </span>,
      <React.Fragment key="type">{renderTypeCell(movement.type)}</React.Fragment>,
      <span key="amount" className="font-bold text-gray-950">
        {formatCurrency(movement.amount)}
      </span>,
      <span key="reason" className="text-gray-600">
        {movement.reason}
      </span>,
      <button
        key="action"
        type="button"
        onClick={() => onSelectReceipt?.(movement)}
        aria-pressed={isSelected}
        className={cn(
          'font-medium hover:underline cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors',
          isSelected ? 'text-blue-800 font-semibold' : 'text-blue-600 hover:text-blue-700'
        )}
        aria-label={`Ver recibo de ${movement.reason}`}
      >
        Ver recibo
      </button>,
    ];
  });

  return (
    <div className={className}>
      {/* Mobile view: individual cards matching mockup */}
      <div className="flex flex-col gap-3 md:hidden">
        {movements.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
            No se encontraron movimientos registrados para esta reserva.
          </div>
        ) : (
          movements.map((movement) => {
            const isSelected = Boolean(
              selectedReceiptId && movement.receiptId === selectedReceiptId
            );

            return (
              <article
                key={movement.id}
                className={cn(
                  'rounded-2xl border bg-white p-4 sm:p-5 shadow-xs transition-colors space-y-1',
                  isSelected
                    ? 'border-blue-400 ring-1 ring-blue-400/30'
                    : 'border-gray-200/90'
                )}
                aria-label={`Movimiento ${movement.type} por ${formatCurrency(movement.amount)}`}
              >
                <div className="flex items-center justify-between">
                  <span className={cn('text-sm tracking-wide', getTypeStyle(movement.type))}>
                    {movement.type}
                  </span>
                  <span className="text-base font-bold text-gray-950">
                    {formatCurrency(movement.amount)}
                  </span>
                </div>
                <p className="text-sm text-gray-800">{movement.reason}</p>
                <p className="text-xs text-gray-500">{movement.date}</p>
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => onSelectReceipt?.(movement)}
                    className={cn(
                      'text-sm font-medium hover:underline cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded',
                      isSelected
                        ? 'text-blue-800 font-semibold'
                        : 'text-blue-600 hover:text-blue-700'
                    )}
                  >
                    Ver recibo
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Desktop view: wide table inside card container */}
      <div className="hidden md:block rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <Table
          headers={headers}
          rows={rows}
          hoverable
          emptyMessage="No se encontraron movimientos registrados para esta reserva."
        />
      </div>
    </div>
  );
}

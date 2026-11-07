import * as React from 'react';
import { Table } from '@/components/ui';
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

  // Complex logic: Map semantic movement type to custom styled React nodes
  const renderTypeCell = (type: ReservationMovement['type']) => {
    switch (type) {
      case 'COBRO':
        return <span className="font-bold text-emerald-600 tracking-wide">COBRO</span>;
      case 'DEVOLUCIÓN':
        return <span className="font-bold text-blue-600 tracking-wide">DEVOLUCIÓN</span>;
      case 'RETENCIÓN':
        return <span className="font-bold text-amber-700 tracking-wide">RETENCIÓN</span>;
      default:
        return <span className="font-bold text-gray-700 tracking-wide">{type}</span>;
    }
  };

  const headers = ['Fecha', 'Tipo', 'Monto', 'Motivo', ''];

  const rows = movements.map((movement) => [
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
      className="text-blue-600 font-medium hover:underline hover:text-blue-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors"
      aria-label={`Ver recibo de ${movement.reason}`}
    >
      Ver recibo
    </button>,
  ]);

  return (
    <div className={className}>
      <Table
        headers={headers}
        rows={rows}
        hoverable
        emptyMessage="No se encontraron movimientos registrados para esta reserva."
      />
    </div>
  );
}

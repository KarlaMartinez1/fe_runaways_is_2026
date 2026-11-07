export interface ReservationDetail {
  id?: string;
  itemTitle: string;
  startDate: string | Date;
  endDate: string | Date;
  daysCount: number;
  subtotal: number;
  securityDeposit: number;
  total: number;
  dueDate: string;
  isReadOnly?: boolean;
}

export interface PaymentSubmissionResult {
  success: boolean;
  transactionId?: string;
  message?: string;
}

export type MovementType = 'COBRO' | 'DEVOLUCIÓN' | 'RETENCIÓN';

export interface ReservationMovement {
  id: string;
  date: string;
  type: MovementType;
  amount: number;
  reason: string;
  receiptId?: string;
}

export interface PaymentReceiptDetail {
  id?: string;
  status: 'Pagada' | 'Devuelta' | 'Retenida' | 'Pendiente';
  itemTitle: string;
  rentalDateRange: string;
  daysCount: number;
  transactionNumber: string;
  paymentDateTime: string;
  rentalSubtotal: number;
  securityDeposit: number;
  totalPaid: number;
  paymentMethod: string;
}


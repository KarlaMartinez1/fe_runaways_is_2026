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

export type DepositDecisionStatus =
  | 'Pendiente de decisión'
  | 'Devuelto'
  | 'Retenido'
  | 'Retenido parcialmente';

export interface DepositInfo {
  id: string;
  reservationId: string;
  itemTitle: string;
  rentalPeriod: string;
  depositAmount: number;
  status: DepositDecisionStatus;
  paymentStatus: 'Pagada' | 'Pendiente';
  decisionDeadline: string;
  daysRemaining: number;
}

export interface DepositMovement {
  id: string;
  date: string;
  type: MovementType;
  amount: number;
  reason: string;
  details: string;
}

export interface RetainDepositFormData {
  amount: number;
  reason: string;
}


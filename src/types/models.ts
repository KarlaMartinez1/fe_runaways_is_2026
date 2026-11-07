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

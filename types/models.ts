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

import type { AccountStatus } from '@/lib/api/types';
export type { AccountStatus };

export type UserRole = 'TENANT' | 'OWNER' | 'ADMIN';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  accountStatus: AccountStatus;
  rating: number;
  ratingCount: number;
  documentType?: string | null;
  documentNumber?: string | null;
  memberSince: string;
  avatarInitials?: string;
}
export interface RoleRequirementItem {
  id: 'verifiedAccount' | 'noPendingPayments' | 'noPendingDeposits';
  label: string;
  met: boolean;
  unmetLabel?: string;
  itemTitle?: string;
  itemDetail?: string;
}
export interface RoleRequirements {
  canSwitch: boolean;
  requirements: RoleRequirementItem[];
  reasonIfNotMet?: string;
  hasPendingPayments?: boolean;
  pendingPaymentDetail?: {
    itemTitle: string;
    amount: string;
    dueDate: string;
  };
  hasPendingDeposits?: boolean;
  pendingDepositDetail?: {
    itemTitle: string;
    amount: string;
    dueDate: string;
  };
}
export interface RoleChangeResult {
  success: boolean;
  newRole?: UserRole;
  message?: string;
  code?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
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
  paymentStatus: 'Pagada' | 'Pendiente' | 'Finalizada' | 'Cancelada';
  bookingStatus?: 'PENDIENTE' | 'PAGADA' | 'FINALIZADA' | 'CANCELADA';
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


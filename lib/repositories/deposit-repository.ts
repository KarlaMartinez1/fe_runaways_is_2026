import type {
  DepositInfo,
  DepositMovement,
  RetainDepositFormData,
} from "@/types";

export interface DepositRepository {
  getDepositInfo(reservationId: string): Promise<DepositInfo | null>;
  getDepositMovements(reservationId: string): Promise<DepositMovement[]>;
  refundDeposit(
    reservationId: string
  ): Promise<{ success: boolean; message: string }>;
  retainDeposit(
    reservationId: string,
    data: RetainDepositFormData
  ): Promise<{ success: boolean; message: string }>;
}

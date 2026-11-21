import type {
  DepositInfo,
  DepositMovement,
  RetainDepositFormData,
} from "@/types";
import type {
  CreateDepositDecisionInput,
  BackendDepositDecisionResponse,
} from "@/lib/api/types";

export interface DepositRepository {
  getDepositInfo(reservationId: string): Promise<DepositInfo | null>;
  getDepositMovements(reservationId: string): Promise<DepositMovement[]>;
  decideDeposit(
    bookingId: string,
    input: CreateDepositDecisionInput
  ): Promise<BackendDepositDecisionResponse>;
  refundDeposit(
    reservationId: string
  ): Promise<{ success: boolean; message: string }>;
  retainDeposit(
    reservationId: string,
    data: RetainDepositFormData
  ): Promise<{ success: boolean; message: string }>;
}

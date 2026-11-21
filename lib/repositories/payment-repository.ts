import type {
  BackendPaymentReceipt,
  BackendPaymentSummary,
  CreatePaymentInput,
} from "@/lib/api/types";

export interface PaymentRepository {
  getSummary(bookingId: string): Promise<BackendPaymentSummary | null>;
  pay(input: CreatePaymentInput): Promise<BackendPaymentReceipt>;
}

import type {
  BackendPaymentReceipt,
  BackendPaymentSummary,
  CreatePaymentInput,
} from "@/lib/api/types";
import type { PaymentRepository } from "../payment-repository";

export const mockPaymentRepository: PaymentRepository = {
  async getSummary(bookingId: string): Promise<BackendPaymentSummary | null> {
    return {
      bookingId,
      propertyTitle: "Cámara Sony Alpha A7 IV",
      startDate: "2026-11-20",
      endDate: "2026-11-23",
      days: 3,
      pricePerDay: "45.00",
      rentalAmount: "135.00",
      depositAmount: "100.00",
      totalAmount: "235.00",
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };
  },

  async pay(input: CreatePaymentInput): Promise<BackendPaymentReceipt> {
    return {
      receiptNumber: `PAY-${Date.now()}`,
      bookingId: input.bookingId,
      paymentDate: new Date().toISOString(),
      propertyTitle: "Cámara Sony Alpha A7 IV",
      startDate: "2026-11-20",
      endDate: "2026-11-23",
      days: 3,
      pricePerDay: "45.00",
      rentalAmount: "135.00",
      depositAmount: "100.00",
      totalAmount: "235.00",
      last4Digits: input.last4Digits,
    };
  },
};

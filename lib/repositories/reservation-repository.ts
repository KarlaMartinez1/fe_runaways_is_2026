import type {
  PaymentReceiptDetail,
  PaymentSubmissionResult,
  ReservationDetail,
  ReservationMovement,
} from "@/types";

export interface ReservationRepository {
  getReservationById(id: string): Promise<ReservationDetail | null>;
  getMovements(reservationId: string): Promise<ReservationMovement[]>;
  getReceiptById(receiptId: string): Promise<PaymentReceiptDetail | null>;
  payReservation(
    reservationId: string,
    paymentData: unknown
  ): Promise<PaymentSubmissionResult>;
}

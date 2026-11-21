import { ApiError, apiGet, apiPost } from "@/lib/api/client";
import type {
  BackendPaymentReceipt,
  BackendPaymentSummary,
} from "@/lib/api/types";
import type {
  PaymentReceiptDetail,
  ReservationDetail,
  ReservationMovement,
} from "@/types";
import type { ReservationRepository } from "../reservation-repository";

export const httpReservationRepository: ReservationRepository = {
  async getReservationById(id: string) {
    // 1. Intentar obtener el resumen de cobros desde el endpoint del backend /api/v1/payments/:bookingId/summary
    try {
      const summary = await apiGet<BackendPaymentSummary>(
        `api/v1/payments/${encodeURIComponent(id)}/summary`
      );
      if (summary && summary.bookingId) {
        return {
          id: summary.bookingId,
          itemTitle: summary.propertyTitle,
          startDate: summary.startDate,
          endDate: summary.endDate,
          daysCount: summary.days,
          subtotal: parseFloat(summary.rentalAmount) || 0,
          securityDeposit: parseFloat(summary.depositAmount) || 0,
          total: parseFloat(summary.totalAmount) || 0,
          dueDate: summary.expiresAt,
          isReadOnly: false,
        };
      }
    } catch (summaryError) {
      if (
        summaryError instanceof ApiError &&
        summaryError.status !== 404 &&
        summaryError.status !== 400
      ) {
        throw summaryError;
      }
    }

    // 2. Fallback al endpoint genérico de reservaciones
    try {
      return await apiGet<ReservationDetail>(
        `api/v1/reservations/${encodeURIComponent(id)}`
      );
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 404 || error.status === 400)
      ) {
        return null;
      }
      throw error;
    }
  },

  async getMovements(reservationId: string) {
    // 1. Intentar endpoint del backend /api/v1/bookings/:bookingId/transactions
    try {
      const result = await apiGet<{
        bookingId: string;
        data: Array<{
          id: string;
          type: "COBRO" | "DEVOLUCION" | "RETENCION";
          amount: string;
          reason: string;
          createdAt: string;
        }>;
      }>(`api/v1/bookings/${encodeURIComponent(reservationId)}/transactions`);

      if (result && Array.isArray(result.data)) {
        return result.data.map((item) => ({
          id: item.id,
          date: item.createdAt
            ? new Date(item.createdAt).toLocaleString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : new Date().toLocaleDateString("es-ES"),
          type: (item.type === "DEVOLUCION" ? "DEVOLUCIÓN" : item.type) as ReservationMovement["type"],
          amount: parseFloat(item.amount) || 0,
          reason: item.reason,
          receiptId: `trx-${item.id}`,
        }));
      }
    } catch {
      // Fallback al endpoint genérico de movimientos
    }

    try {
      return await apiGet<ReservationMovement[]>(
        `api/v1/reservations/${encodeURIComponent(reservationId)}/movements`
      );
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 404 || error.status === 400)
      ) {
        return [];
      }
      throw error;
    }
  },

  async getReceiptById(receiptId: string) {
    try {
      return await apiGet<PaymentReceiptDetail>(
        `api/v1/receipts/${encodeURIComponent(receiptId)}`
      );
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 404 || error.status === 400)
      ) {
        return null;
      }
      throw error;
    }
  },

  async payReservation(reservationId: string, paymentData: unknown) {
    const data = paymentData as { last4Digits?: string; cardNumber?: string };
    const last4 = data?.last4Digits || (data?.cardNumber ? data.cardNumber.slice(-4) : "4242");

    try {
      const receipt = await apiPost<BackendPaymentReceipt>("api/v1/payments", {
        bookingId: reservationId,
        last4Digits: last4,
      });

      return {
        success: true,
        transactionId: receipt.receiptNumber,
        message: "Pago procesado exitosamente.",
      };
    } catch (error) {
      if (error instanceof ApiError) {
        return {
          success: false,
          message: error.message,
        };
      }
      return {
        success: false,
        message: "Error al procesar el pago.",
      };
    }
  },
};


import { ApiError, apiGet, apiPost } from "@/lib/api/client";
import type {
  CreateDepositDecisionInput,
  BackendDepositDecisionResponse,
  BackendPaymentSummary,
  BackendTransactionHistoryResponse,
  BackendDepositStatus,
} from "@/lib/api/types";
import {
  depositMessages,
  backendDepositStateLabels,
} from "@/lib/messages/deposit";
import type {
  DepositDecisionStatus,
  DepositInfo,
  DepositMovement,
  MovementType,
  RetainDepositFormData,
} from "@/types";
import type { DepositRepository } from "../deposit-repository";

interface RawOwnerBooking {
  id: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  subtotal: string;
  status: string;
  deliveredAt?: string | null;
  returnedAt?: string | null;
  finalizedAt?: string | null;
  property?: {
    title: string;
    securityDeposit?: string;
  };
  deposit?: {
    id: string;
    amount: string;
    state: BackendDepositStatus;
    retainedAmount: string;
    returnedAmount: string;
    decidedAt: string | null;
  } | null;
}

function calculateDaysRemaining(endDate: string): { deadline: string; days: number } {
  const end = new Date(endDate);
  const deadlineDate = new Date(end.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const days = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
  const deadlineStr = deadlineDate.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return { deadline: deadlineStr, days };
}

export const httpDepositRepository: DepositRepository = {
  async getDepositInfo(reservationId: string): Promise<DepositInfo | null> {
    // 1. Intentar buscar en las reservas del arrendador (owner/bookings)
    try {
      const ownerBookings = await apiGet<{ data: RawOwnerBooking[] }>(
        "api/v1/owner/bookings"
      ).catch(() => null);

      const booking = ownerBookings?.data?.find((b) => b.id === reservationId);
      if (booking) {
        const depositAmount = parseFloat(
          booking.deposit?.amount || booking.property?.securityDeposit || "0"
        );
        const state: BackendDepositStatus = booking.deposit?.state || "PENDING";
        const statusLabel: DepositDecisionStatus =
          backendDepositStateLabels[state] || "Pendiente de decisión";
        const { deadline, days } = calculateDaysRemaining(booking.endDate);

        return {
          id: booking.deposit?.id || `dep-${booking.id}`,
          reservationId: booking.id,
          itemTitle: booking.property?.title || "Bien en renta",
          rentalPeriod: `Del ${new Date(booking.startDate).toLocaleDateString("es-ES")} al ${new Date(booking.endDate).toLocaleDateString("es-ES")}`,
          depositAmount,
          status: statusLabel,
          paymentStatus: booking.status === "PENDING" ? "Pendiente" : "Pagada",
          decisionDeadline: deadline,
          daysRemaining: days,
        };
      }
    } catch {
      // Ignorar y continuar con alternativas
    }

    // 2. Intentar obtener el resumen de pagos si la reserva fue consultada
    try {
      const summary = await apiGet<BackendPaymentSummary>(
        `api/v1/payments/${encodeURIComponent(reservationId)}/summary`
      );
      if (summary && summary.bookingId) {
        const { deadline, days } = calculateDaysRemaining(summary.endDate);
        return {
          id: `dep-${summary.bookingId}`,
          reservationId: summary.bookingId,
          itemTitle: summary.propertyTitle,
          rentalPeriod: `Del ${summary.startDate} al ${summary.endDate}`,
          depositAmount: parseFloat(summary.depositAmount) || 0,
          status: "Pendiente de decisión",
          paymentStatus: "Pagada",
          decisionDeadline: deadline,
          daysRemaining: days,
        };
      }
    } catch {
      // Ignorar y continuar
    }

    // 3. Fallback al endpoint genérico de depósitos
    try {
      return await apiGet<DepositInfo>(
        `api/v1/reservations/${encodeURIComponent(reservationId)}/deposit`
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

  async getDepositMovements(reservationId: string): Promise<DepositMovement[]> {
    // 1. Intentar obtener historial desde /api/v1/bookings/:id/transactions
    try {
      const result = await apiGet<BackendTransactionHistoryResponse>(
        `api/v1/bookings/${encodeURIComponent(reservationId)}/transactions`
      );

      if (result && Array.isArray(result.data)) {
        return result.data.map((item) => {
          const rawType = item.type;
          let mappedType: MovementType = "COBRO";
          if (rawType === "DEVOLUCION") {
            mappedType = "DEVOLUCIÓN";
          } else if (rawType === "RETENCION") {
            mappedType = "RETENCIÓN";
          }

          return {
            id: item.id,
            date: item.createdAt
              ? new Date(item.createdAt).toLocaleDateString("es-ES")
              : new Date().toLocaleDateString("es-ES"),
            type: mappedType,
            amount: parseFloat(item.amount) || 0,
            reason: item.reason,
            details:
              rawType === "COBRO"
                ? "Tarjeta de crédito / débito"
                : "Cuenta de origen",
          };
        });
      }
    } catch {
      // Continuar con fallback
    }

    // 2. Fallback a endpoint de movimientos
    try {
      return await apiGet<DepositMovement[]>(
        `api/v1/reservations/${encodeURIComponent(reservationId)}/deposit/movements`
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

  async decideDeposit(
    bookingId: string,
    input: CreateDepositDecisionInput
  ): Promise<BackendDepositDecisionResponse> {
    return await apiPost<BackendDepositDecisionResponse, CreateDepositDecisionInput>(
      `api/v1/bookings/${encodeURIComponent(bookingId)}/deposit/decision`,
      input
    );
  },

  async refundDeposit(reservationId: string) {
    await this.decideDeposit(reservationId, {
      decisionType: "DEVOLVER",
    });
    return {
      success: true,
      message: depositMessages.refundSuccessNotice,
    };
  },

  async retainDeposit(reservationId: string, data: RetainDepositFormData) {
    const amountStr =
      typeof data.amount === "number"
        ? data.amount.toFixed(2)
        : String(data.amount);

    await this.decideDeposit(reservationId, {
      decisionType: "RETENER",
      retentionAmount: amountStr,
      retentionReason: data.reason,
    });

    return {
      success: true,
      message: depositMessages.retentionSuccessNotice,
    };
  },
};

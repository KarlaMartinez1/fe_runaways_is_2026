import { ApiError } from "@/lib/api/client";
import { bookingMessages } from "@/lib/messages/bookings";
import type { ReservationRepository } from "../reservation-repository";
import {
  defaultReservationFixture,
  reservationFixtures,
} from "./fixtures/reservations";
import { reservationMovementsFixtures } from "./fixtures/movements";
import { paymentReceiptFixtures } from "./fixtures/receipts";
import { isMockUserVerified } from "./identity-document-repository.mock";

export const mockReservationRepository: ReservationRepository = {
  async getReservationById(id: string) {
    if (!id || id === "default") {
      return defaultReservationFixture;
    }
    return reservationFixtures[id] ?? defaultReservationFixture;
  },

  async getMovements(reservationId: string) {
    return (
      reservationMovementsFixtures[reservationId] ??
      reservationMovementsFixtures.default
    );
  },

  async getReceiptById(receiptId: string) {
    return paymentReceiptFixtures[receiptId] ?? null;
  },

  async payReservation(reservationId: string) {
    // H21: no se puede pagar una reserva sin cuenta verificada.
    if (!(await isMockUserVerified())) {
      throw new ApiError(403, "VERIFICATION_REQUIRED", bookingMessages.verificationRequired);
    }
    return {
      success: true,
      transactionId: `TRX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      message: `Pago de reserva ${reservationId} procesado correctamente.`,
    };
  },
};
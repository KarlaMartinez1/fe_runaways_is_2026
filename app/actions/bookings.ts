"use server";

import { ApiError } from "@/lib/api/client";
import { validateBookingRange } from "@/lib/bookings/rules";
import { bookingMessages } from "@/lib/messages/bookings";
import { bookingRepository } from "@/lib/repositories";

export type CreateBookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; message: string; conflict?: boolean; sessionExpired?: boolean };

export async function createBookingAction(input: {
  propertyId: string;
  startDate: string;
  endDate: string;
}): Promise<CreateBookingResult> {
  const rangeError = validateBookingRange(input.startDate, input.endDate);
  if (rangeError) {
    return { ok: false, message: rangeError };
  }

  try {
    const booking = await bookingRepository.create(input);
    return { ok: true, bookingId: booking.id };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        return { ok: false, message: bookingMessages.sessionExpired, sessionExpired: true };
      }
      if (error.code === "VERIFICATION_REQUIRED") {
        return { ok: false, message: bookingMessages.verificationRequired };
      }
      if (error.status === 409) {
        return { ok: false, message: bookingMessages.unavailableDates, conflict: true };
      }
      if (error.status === 404) {
        return { ok: false, message: bookingMessages.propertyUnavailable };
      }
      if (error.status === 403) {
        return { ok: false, message: bookingMessages.notAllowed };
      }
      if (error.status === 400 && error.message) {
        return { ok: false, message: error.message };
      }
    }

    console.error("Error al crear la reserva:", error);
    return { ok: false, message: bookingMessages.genericError };
  }
}
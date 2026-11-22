import { createBookingAction } from "./bookings";
import { ApiError } from "@/lib/api/client";
import { bookingMessages } from "@/lib/messages/bookings";
import { bookingRepository } from "@/lib/repositories";

jest.mock("next/headers", () => ({ cookies: jest.fn() }));
jest.mock("@/lib/repositories", () => ({
  bookingRepository: { create: jest.fn() },
}));

describe("H10. Permisos al crear una reserva", () => {
  beforeEach(() => jest.clearAllMocks());

  it("AC8: traduce el rechazo del servidor para roles que no pueden reservar", async () => {
    (bookingRepository.create as jest.Mock).mockRejectedValue(new ApiError(403, "FORBIDDEN"));

    const result = await createBookingAction({
      propertyId: "property-1",
      startDate: "2026-11-25",
      endDate: "2026-11-27",
    });

    expect(result).toEqual({ ok: false, message: bookingMessages.notAllowed });
  });
});

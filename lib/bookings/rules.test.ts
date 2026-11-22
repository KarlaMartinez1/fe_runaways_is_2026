import { countBookingDays, validateBookingRange } from "./rules";
import { bookingMessages } from "@/lib/messages/bookings";

describe("H10. Crear una reserva", () => {
  it("AC2: cuenta ambos extremos e incluye un día cuando inicio y fin coinciden", () => {
    expect(countBookingDays("2026-11-10", "2026-11-12")).toBe(3);
    expect(countBookingDays("2026-11-10", "2026-11-10")).toBe(1);
  });

  it("AC7: rechaza fin anterior al inicio, rangos mayores de 30 días y fechas fuera de los 90 días", () => {
    const today = "2026-11-22";

    expect(validateBookingRange("2026-11-23", "2026-11-22", today)).toBe(
      bookingMessages.endBeforeStart,
    );
    expect(validateBookingRange("2026-11-22", "2026-12-22", today)).toBe(
      bookingMessages.tooLong,
    );
    expect(validateBookingRange("2027-02-20", "2027-02-20", today)).toBe(
      bookingMessages.outsideWindow,
    );
  });
});

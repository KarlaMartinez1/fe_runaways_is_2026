import { ApiError } from "@/lib/api/client";
import { bookingMessages } from "@/lib/messages/bookings";
import { addDaysIso, todayInElSalvador } from "@/lib/utils/dates";
import {
  getMockBookedDates,
  getMockOccupiedDates,
  mockBookingRepository,
} from "./booking-repository.mock";

jest.mock("./identity-document-repository.mock", () => ({
  isMockUserVerified: jest.fn().mockResolvedValue(true),
}));

describe("H10. Crear una reserva en el mock", () => {
  afterEach(() => jest.useRealTimers());

  it("AC5: crea PENDIENTE por 24 horas y al vencer la cancela y libera las fechas", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-11-22T12:00:00.000Z"));
    const today = todayInElSalvador();
    const occupied = getMockOccupiedDates("p-01");
    const offset = Array.from({ length: 80 }, (_, index) => index + 1).find((day) =>
      !occupied.includes(addDaysIso(today, day)),
    );
    if (!offset) throw new Error("No se encontró una fecha libre para la prueba");
    const startDate = addDaysIso(today, offset);

    const created = await mockBookingRepository.create({ propertyId: "p-01", startDate, endDate: startDate });
    expect(created.status).toBe("PENDIENTE");
    expect(Date.parse(created.expiresAt) - Date.now()).toBe(24 * 60 * 60 * 1000);
    expect(getMockBookedDates("p-01")).toContain(startDate);

    jest.setSystemTime(Date.now() + 24 * 60 * 60 * 1000 + 1);
    const bookings = await mockBookingRepository.listMine({ page: 1 });
    expect(bookings.data.find((booking) => booking.id === created.id)?.status).toBe("CANCELADA");
    expect(getMockBookedDates("p-01")).not.toContain(startDate);
  });

  it("AC6: ante solicitudes concurrentes para el mismo período, solo crea una", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-11-22T12:00:00.000Z"));
    const today = todayInElSalvador();
    const occupied = getMockOccupiedDates("p-02");
    const offset = Array.from({ length: 80 }, (_, index) => index + 1).find((day) =>
      !occupied.includes(addDaysIso(today, day)) && !occupied.includes(addDaysIso(today, day + 1)),
    );
    if (!offset) throw new Error("No se encontró una fecha libre para la prueba");
    const startDate = addDaysIso(today, offset);
    const input = { propertyId: "p-02", startDate, endDate: addDaysIso(startDate, 1) };

    const results = await Promise.allSettled([
      mockBookingRepository.create(input),
      mockBookingRepository.create(input),
    ]);
    const fulfilled = results.filter((result) => result.status === "fulfilled");
    const rejected = results.filter((result) => result.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    const error = rejected[0].status === "rejected" ? rejected[0].reason : null;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("DATES_UNAVAILABLE");
    expect(error.message).toBe(bookingMessages.unavailableDates);
  });
});

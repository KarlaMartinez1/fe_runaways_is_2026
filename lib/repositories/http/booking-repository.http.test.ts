import { apiGet, apiPost } from "@/lib/api/client";
import { httpBookingRepository } from "./booking-repository.http";

jest.mock("@/lib/api/client", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
}));

describe("H10. Contrato HTTP de reservas", () => {
  beforeEach(() => jest.clearAllMocks());

  it("AC9: consulta Mis reservas y Reservas de mis bienes por sus rutas de sesión", async () => {
    (apiGet as jest.Mock).mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 1 });

    await httpBookingRepository.listMine({ page: 1 });
    await httpBookingRepository.listLessor({ page: 1, propertyId: "property-1" });

    expect(apiGet).toHaveBeenNthCalledWith(1, "api/v1/bookings/mine?page=1&pageSize=10");
    expect(apiGet).toHaveBeenNthCalledWith(
      2,
      "api/v1/owner/bookings?page=1&propertyId=property-1&pageSize=10",
    );
  });

  it("AC10: crea la reserva enviando solo bien y fechas; la notificación queda a cargo del backend", async () => {
    (apiPost as jest.Mock).mockResolvedValue({
      id: "booking-1",
      propertyId: "property-1",
      startDate: "2026-11-25",
      endDate: "2026-11-27",
      days: 3,
      pricePerDay: "25.00",
      subtotal: "75.00",
      status: "PENDING",
      expiresAt: "2026-11-23T12:00:00.000Z",
    });

    const created = await httpBookingRepository.create({
      propertyId: "property-1",
      startDate: "2026-11-25",
      endDate: "2026-11-27",
    });

    expect(apiPost).toHaveBeenCalledWith("api/v1/bookings", {
      propertyId: "property-1",
      startDate: "2026-11-25",
      endDate: "2026-11-27",
    });
    expect(created.status).toBe("PENDIENTE");
  });
});

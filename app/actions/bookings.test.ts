import { ApiError } from "@/lib/api/client";
import { createBookingAction } from "@/app/actions/bookings";
import { bookingMessages } from "@/lib/messages/bookings";
import { bookingRepository } from "@/lib/repositories";
import { addDaysIso, todayInElSalvador } from "@/lib/utils/dates";

jest.mock("@/lib/repositories", () => ({
  bookingRepository: {
    create: jest.fn(),
  },
}));

const mockedCreate = bookingRepository.create as jest.MockedFunction<
  typeof bookingRepository.create
>;

const today = todayInElSalvador();
const validInput = {
  propertyId: "property-1",
  startDate: addDaysIso(today, 5),
  endDate: addDaysIso(today, 7),
};

describe("createBookingAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rechaza un rango inválido antes de llamar al repositorio", async () => {
    const result = await createBookingAction({
      ...validInput,
      startDate: addDaysIso(today, -1),
    });

    expect(result).toEqual({ ok: false, message: bookingMessages.startBeforeToday });
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("devuelve el id cuando crea la reserva", async () => {
    mockedCreate.mockResolvedValueOnce({
      id: "booking-1",
      ...validInput,
      days: 3,
      pricePerDay: "25.50",
      subtotal: "76.50",
      status: "PENDIENTE",
      expiresAt: "2026-11-25T18:00:00.000Z",
    });

    const result = await createBookingAction(validInput);

    expect(result).toEqual({ ok: true, bookingId: "booking-1" });
    expect(mockedCreate).toHaveBeenCalledWith(validInput);
  });

  it("marca la sesión como expirada ante un 401", async () => {
    mockedCreate.mockRejectedValueOnce(new ApiError(401, "UNAUTHORIZED"));

    await expect(createBookingAction(validInput)).resolves.toEqual({
      ok: false,
      message: bookingMessages.sessionExpired,
      sessionExpired: true,
    });
  });

  it("devuelve el requisito de verificación del backend", async () => {
    mockedCreate.mockRejectedValueOnce(new ApiError(403, "VERIFICATION_REQUIRED"));

    await expect(createBookingAction(validInput)).resolves.toEqual({
      ok: false,
      message: bookingMessages.verificationRequired,
      verificationRequired: true,
    });
  });

  it("muestra el conflicto si las fechas dejaron de estar disponibles", async () => {
    mockedCreate.mockRejectedValueOnce(new ApiError(409, "DATES_UNAVAILABLE"));

    await expect(createBookingAction(validInput)).resolves.toEqual({
      ok: false,
      message: bookingMessages.unavailableDates,
      conflict: true,
    });
  });

  it("muestra que el bien ya no está disponible ante el 404 específico", async () => {
    mockedCreate.mockRejectedValueOnce(new ApiError(404, "PROPERTY_NOT_AVAILABLE"));

    await expect(createBookingAction(validInput)).resolves.toEqual({
      ok: false,
      message: bookingMessages.propertyUnavailable,
    });
  });

  it("rechaza una cuenta sin permiso para reservar", async () => {
    mockedCreate.mockRejectedValueOnce(new ApiError(403, "FORBIDDEN"));

    await expect(createBookingAction(validInput)).resolves.toEqual({
      ok: false,
      message: bookingMessages.notAllowed,
    });
  });

  it("conserva el mensaje de validación de la API", async () => {
    mockedCreate.mockRejectedValueOnce(
      new ApiError(400, "VALIDATION_ERROR", "La fecha no es válida.")
    );

    await expect(createBookingAction(validInput)).resolves.toEqual({
      ok: false,
      message: "La fecha no es válida.",
    });
  });

  it("devuelve el mensaje genérico ante un error inesperado", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    mockedCreate.mockRejectedValueOnce(new Error("unexpected"));

    await expect(createBookingAction(validInput)).resolves.toEqual({
      ok: false,
      message: bookingMessages.genericError,
    });
    consoleError.mockRestore();
  });
});

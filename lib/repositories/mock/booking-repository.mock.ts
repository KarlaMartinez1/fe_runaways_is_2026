import { ApiError } from "@/lib/api/client";
import type { BookingListItem, BookingListResult, BookingStatus, CreatedBooking, Paginated } from "@/lib/api/types";
import {
  calculateSubtotal,
  countBookingDays,
  PAYMENT_WINDOW_HOURS,
  rangeOverlapsOccupied,
  validateBookingRange,
} from "@/lib/bookings/rules";
import { bookingMessages } from "@/lib/messages/bookings";
import { addDaysIso } from "@/lib/utils/dates";
import type { BookingRepository, CreateBookingInput, ListBookingsParams } from "../booking-repository";
import { buildMockAvailability } from "./fixtures/availability";
import { propertyFixtures } from "./fixtures/properties";
import { getMockBlockedDates } from "./block-store";

const PAGE_SIZE = 10;

type StoredBooking = {
  id: string;
  propertyId: string;
  lesseeName: string;
  startDate: string;
  endDate: string;
  days: number;
  pricePerDay: string;
  subtotal: string;
  status: BookingStatus;
  expiresAt: string;
  cancelReason: "VENCIDA" | null;
  createdAt: string;
};

// Almacén en memoria: se pierde al reiniciar el servidor de desarrollo.
const bookingsStore: StoredBooking[] = [];

// Simula la tarea programada de 24 horas: PENDIENTE vencida pasa a CANCELADA.
function expireStalePending(now = Date.now()) {
  for (const booking of bookingsStore) {
    if (booking.status === "PENDIENTE" && Date.parse(booking.expiresAt) <= now) {
      booking.status = "CANCELADA";
      booking.cancelReason = "VENCIDA";
    }
  }
}

function occupiesDates(booking: StoredBooking) {
  return booking.status === "PENDIENTE" || booking.status === "PAGADA";
}

// Días ocupados por reservas activas en el store (se suman a los del fixture de H9).
export function getMockBookedDates(propertyId: string): string[] {
  expireStalePending();
  const dates = new Set<string>();
  for (const booking of bookingsStore) {
    if (booking.propertyId !== propertyId || !occupiesDates(booking)) continue;
    const days = countBookingDays(booking.startDate, booking.endDate);
    for (let offset = 0; offset < days; offset++) {
      dates.add(addDaysIso(booking.startDate, offset));
    }
  }
  return [...dates];
}

export function getMockOccupiedDates(propertyId: string): string[] {
  const { occupiedDates } = buildMockAvailability(propertyId);
  return [
    ...new Set([
      ...occupiedDates,
      ...getMockBookedDates(propertyId),
      ...getMockBlockedDates(propertyId),
    ]),
  ].sort();
}

function toListItem(booking: StoredBooking): BookingListItem {
  const property = propertyFixtures.find((item) => item.id === booking.propertyId);
  return {
    id: booking.id,
    propertyId: booking.propertyId,
    propertyTitle: property?.title ?? "Bien",
    startDate: booking.startDate,
    endDate: booking.endDate,
    days: booking.days,
    subtotal: booking.subtotal,
    status: booking.status,
    expiresAt: booking.status === "PENDIENTE" ? booking.expiresAt : null,
    cancelReason: booking.cancelReason,
    deliveredAt: null,
    returnedAt: null,
    lesseeName: booking.lesseeName,
  };
}

function paginate<T>(items: T[], page: number): Paginated<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  return { data: items.slice(start, start + PAGE_SIZE), page, totalPages, total };
}

export const mockBookingRepository: BookingRepository = {
  async create(input: CreateBookingInput): Promise<CreatedBooking> {
    expireStalePending();

    if (process.env.MOCK_ACCOUNT_STATUS !== "VERIFICADA") {
      throw new ApiError(403, "VERIFICATION_REQUIRED", bookingMessages.verificationRequired);
    }

    const property = propertyFixtures.find((item) => item.id === input.propertyId);
    if (!property || property.status !== "DISPONIBLE") {
      throw new ApiError(404, "NOT_FOUND", bookingMessages.propertyUnavailable);
    }

    const rangeError = validateBookingRange(input.startDate, input.endDate);
    if (rangeError) {
      throw new ApiError(400, "VALIDATION_ERROR", rangeError);
    }

    const occupied = getMockOccupiedDates(input.propertyId);
    if (rangeOverlapsOccupied(input.startDate, input.endDate, occupied)) {
      throw new ApiError(409, "DATES_UNAVAILABLE", bookingMessages.unavailableDates);
    }

    const days = countBookingDays(input.startDate, input.endDate);
    const subtotal = calculateSubtotal(property.pricePerDay, days);
    const now = Date.now();

    const booking: StoredBooking = {
      id: crypto.randomUUID(),
      propertyId: input.propertyId,
      lesseeName: "Arrendatario de prueba",
      startDate: input.startDate,
      endDate: input.endDate,
      days,
      pricePerDay: property.pricePerDay,
      subtotal,
      status: "PENDIENTE",
      expiresAt: new Date(now + PAYMENT_WINDOW_HOURS * 3_600_000).toISOString(),
      cancelReason: null,
      createdAt: new Date(now).toISOString(),
    };
    bookingsStore.push(booking);

    return {
      id: booking.id,
      propertyId: booking.propertyId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      days,
      pricePerDay: booking.pricePerDay,
      subtotal,
      status: booking.status,
      expiresAt: booking.expiresAt,
    };
  },

  async listMine({ page, status }: ListBookingsParams): Promise<BookingListResult> {
    expireStalePending();
    const items = bookingsStore
      .filter((booking) => !status || booking.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(toListItem);
    return paginate(items, page);
  },

  async listLessor({ page, status, propertyId }: ListBookingsParams): Promise<BookingListResult> {
    expireStalePending();
    const items = bookingsStore
      .filter((booking) => !status || booking.status === status)
      .filter((booking) => !propertyId || booking.propertyId === propertyId)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .map(toListItem);
    return paginate(items, page);
  },
};
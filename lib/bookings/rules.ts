import { bookingMessages } from "@/lib/messages/bookings";
import { addDaysIso, todayInElSalvador } from "@/lib/utils/dates";

export const MAX_BOOKING_DAYS = 30;
export const BOOKING_WINDOW_DAYS = 90;
export const PAYMENT_WINDOW_HOURS = 24;

// Inicio y fin cuentan como días: del 10 al 12 son 3 días.
export function countBookingDays(startDate: string, endDate: string): number {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  return Math.round((end - start) / 86_400_000) + 1;
}

// Se calcula en centavos para evitar errores de punto flotante.
export function calculateSubtotal(pricePerDay: string, days: number): string {
  const cents = Math.round(Number(pricePerDay) * 100) * days;
  return (cents / 100).toFixed(2);
}

export function rangeOverlapsOccupied(startDate: string, endDate: string, occupied: string[]): boolean {
  return occupied.some((date) => date >= startDate && date <= endDate);
}

// Validación de UX. El servidor es la fuente de verdad.
export function validateBookingRange(
  startDate: string | null,
  endDate: string | null,
  today: string = todayInElSalvador(),
): string | null {
  if (!startDate || !endDate) return bookingMessages.selectBothDates;
  if (startDate < today) return bookingMessages.startBeforeToday;
  if (endDate < startDate) return bookingMessages.endBeforeStart;
  if (endDate > addDaysIso(today, BOOKING_WINDOW_DAYS - 1)) return bookingMessages.outsideWindow;
  if (countBookingDays(startDate, endDate) > MAX_BOOKING_DAYS) return bookingMessages.tooLong;
  return null;
}
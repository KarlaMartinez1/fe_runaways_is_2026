import type { BookingStatus } from "@/lib/api/types";
import { addDaysIso, todayInElSalvador } from "@/lib/utils/dates";

// Usuario simulado con sesión en los mocks.
export const MOCK_CURRENT_USER_ID = "user-01";

const DAY_MS = 86_400_000;

export type RateableReservationSeed = {
  id: string;
  propertyId: string;
  lesseeId: string;
  startDate: string;
  endDate: string;
  days: number;
  status: BookingStatus;
  finalizedAt: string | null;
  ratedInitially: boolean;
};

const today = todayInElSalvador();

function daysAgoIso(days: number) {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

function buildSeed(input: {
  id: string;
  propertyId: string;
  lesseeId: string;
  startOffset: number;
  days: number;
  status: BookingStatus;
  finalizedDaysAgo: number | null;
  ratedInitially?: boolean;
}): RateableReservationSeed {
  const startDate = addDaysIso(today, input.startOffset);
  return {
    id: input.id,
    propertyId: input.propertyId,
    lesseeId: input.lesseeId,
    startDate,
    endDate: addDaysIso(startDate, input.days - 1),
    days: input.days,
    status: input.status,
    finalizedAt: input.finalizedDaysAgo === null ? null : daysAgoIso(input.finalizedDaysAgo),
    ratedInitially: input.ratedInitially ?? false,
  };
}

export const rateableReservationSeeds: RateableReservationSeed[] = [
  // Finalizada, dentro de plazo y sin reseña: se puede calificar.
  buildSeed({ id: "rate-01", propertyId: "p-01", lesseeId: MOCK_CURRENT_USER_ID, startOffset: -10, days: 3, status: "FINALIZADA", finalizedDaysAgo: 3 }),
  // Finalizada hace 20 días: plazo de 14 días vencido.
  buildSeed({ id: "rate-02", propertyId: "p-02", lesseeId: MOCK_CURRENT_USER_ID, startOffset: -30, days: 2, status: "FINALIZADA", finalizedDaysAgo: 20 }),
  // Finalizada y ya calificada por este usuario.
  buildSeed({ id: "rate-03", propertyId: "p-14", lesseeId: MOCK_CURRENT_USER_ID, startOffset: -6, days: 2, status: "FINALIZADA", finalizedDaysAgo: 2, ratedInitially: true }),
  // Aún no finalizada (pagada): no se puede calificar.
  buildSeed({ id: "rate-04", propertyId: "p-01", lesseeId: MOCK_CURRENT_USER_ID, startOffset: 3, days: 2, status: "PAGADA", finalizedDaysAgo: null }),
  // Reserva de otro usuario: no es visible para el usuario en sesión.
  buildSeed({ id: "rate-05", propertyId: "p-02", lesseeId: "user-99", startOffset: -4, days: 2, status: "FINALIZADA", finalizedDaysAgo: 1 }),
];
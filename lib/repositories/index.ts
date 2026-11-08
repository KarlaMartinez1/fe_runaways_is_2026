import { httpPropertyRepository } from "./http/property-repository.http";
import { mockPropertyRepository } from "./mock/property-repository.mock";
import { httpReservationRepository } from "./http/reservation-repository.http";
import { mockReservationRepository } from "./mock/reservation-repository.mock";
import { httpDepositRepository } from "./http/deposit-repository.http";
import { mockDepositRepository } from "./mock/deposit-repository.mock";

// Si USE_MOCKS es "true", o si no se ha configurado API_URL en el entorno,
// se activan los repositorios mock para permitir desarrollo local fluido sin backend.
const useMocks =
  process.env.USE_MOCKS === "true" ||
  (process.env.USE_MOCKS !== "false" && !process.env.API_URL);

export const propertyRepository = useMocks
  ? mockPropertyRepository
  : httpPropertyRepository;

export const reservationRepository = useMocks
  ? mockReservationRepository
  : httpReservationRepository;

export const depositRepository = useMocks
  ? mockDepositRepository
  : httpDepositRepository;

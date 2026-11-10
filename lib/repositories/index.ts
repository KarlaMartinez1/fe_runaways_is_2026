import { httpBlockRepository } from "./http/block-repository.http";
import { httpBookingRepository } from "./http/booking-repository.http";
import { httpPropertyRepository } from "./http/property-repository.http";
import { httpProfileRepository } from "./http/profile-repository.http";
import { httpReservationRepository } from "./http/reservation-repository.http";
import { mockBlockRepository } from "./mock/block-repository.mock";
import { mockBookingRepository } from "./mock/booking-repository.mock";
import { mockPropertyRepository } from "./mock/property-repository.mock";
import { mockProfileRepository } from "./mock/profile-repository.mock";
import { mockReservationRepository } from "./mock/reservation-repository.mock";
import { httpDepositRepository } from "./http/deposit-repository.http";
import { mockDepositRepository } from "./mock/deposit-repository.mock";

const useMocks = process.env.USE_MOCKS === "true";

export const propertyRepository = useMocks
  ? mockPropertyRepository
  : httpPropertyRepository;

export const profileRepository = useMocks
  ? mockProfileRepository
  : httpProfileRepository;

export const reservationRepository = useMocks
  ? mockReservationRepository
  : httpReservationRepository;

export const depositRepository = useMocks
  ? mockDepositRepository
  : httpDepositRepository;

export const bookingRepository = useMocks 
  ? mockBookingRepository 
  : httpBookingRepository;

export const blockRepository = useMocks 
  ? mockBlockRepository 
  : httpBlockRepository;


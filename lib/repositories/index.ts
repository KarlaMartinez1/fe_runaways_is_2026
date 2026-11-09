import { httpBookingRepository } from "./http/booking-repository.http";
import { httpPropertyRepository } from "./http/property-repository.http";
import { httpProfileRepository } from "./http/profile-repository.http";
import { mockBookingRepository } from "./mock/booking-repository.mock";
import { httpReservationRepository } from "./http/reservation-repository.http";
import { mockReservationRepository } from "./mock/reservation-repository.mock";
import { mockPropertyRepository } from "./mock/property-repository.mock";
import { mockProfileRepository } from "./mock/profile-repository.mock";

const useMocks = process.env.USE_MOCKS === "true";

export const propertyRepository = useMocks ? mockPropertyRepository : httpPropertyRepository;
export const profileRepository = useMocks ? mockProfileRepository : httpProfileRepository;
export const bookingRepository = useMocks ? mockBookingRepository : httpBookingRepository;
export const reservationRepository = useMocks ? mockReservationRepository : httpReservationRepository;

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
import { httpReportRepository } from "./http/report-repository.http";
import { mockReportRepository } from "./mock/report-repository.mock";
import { httpAdminRepository } from "./http/admin-repository.http";
import { mockAdminRepository } from "./mock/admin-repository.mock";
import { httpIdentityDocumentRepository } from "./http/identity-document-repository.http";
import { mockIdentityDocumentRepository } from "./mock/identity-document-repository.mock";
import { httpReviewRepository } from "./http/review-repository.http";
import { mockReviewRepository } from "./mock/review-repository.mock";
import { httpConversationRepository } from "./http/conversation-repository.http";
import { mockConversationRepository } from "./mock/conversation-repository.mock";
import { httpNotificationRepository } from "./http/notification-repository.http";
import { mockNotificationRepository } from "./mock/notification-repository.mock";
import { httpPaymentRepository } from "./http/payment-repository.http";
import { mockPaymentRepository } from "./mock/payment-repository.mock";

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

export const reportRepository = useMocks
  ? mockReportRepository
  : httpReportRepository;

export const identityDocumentRepository = useMocks
  ? mockIdentityDocumentRepository
  : httpIdentityDocumentRepository;

export const adminRepository = useMocks
  ? mockAdminRepository
  : httpAdminRepository;

export const reviewRepository = useMocks
  ? mockReviewRepository
  : httpReviewRepository;

export const conversationRepository = useMocks
  ? mockConversationRepository
  : httpConversationRepository;

export const notificationRepository = useMocks
  ? mockNotificationRepository
  : httpNotificationRepository;

export const paymentRepository = useMocks
  ? mockPaymentRepository
  : httpPaymentRepository;

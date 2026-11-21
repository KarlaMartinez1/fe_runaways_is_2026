import type { BookingListResult, BookingStatus, CreatedBooking } from "@/lib/api/types";

export type CreateBookingInput = {
  propertyId: string;
  startDate: string;
  endDate: string;
};

export type ListBookingsParams = {
  page: number;
  status?: BookingStatus;
  propertyId?: string;
};

export interface BookingRepository {
  create(input: CreateBookingInput): Promise<CreatedBooking>;
  listMine(params: ListBookingsParams): Promise<BookingListResult>;
  listLessor(params: ListBookingsParams): Promise<BookingListResult>;
}
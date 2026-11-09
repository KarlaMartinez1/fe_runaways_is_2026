import { apiGet, apiPost } from "@/lib/api/client";
import type { BookingListResult, CreatedBooking } from "@/lib/api/types";
import type { BookingRepository, ListBookingsParams } from "../booking-repository";

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return search.toString();
}

export const httpBookingRepository: BookingRepository = {
  create(input) {
    return apiPost<CreatedBooking>("api/v1/bookings", input);
  },

  listMine({ page, status }: ListBookingsParams) {
    const query = buildQuery({ page, status, pageSize: 10 });
    return apiGet<BookingListResult>(`api/v1/bookings/mine?${query}`);
  },

  listLessor({ page, status, propertyId }: ListBookingsParams) {
    const query = buildQuery({ page, status, propertyId, pageSize: 10 });
    return apiGet<BookingListResult>(`api/v1/lessor/bookings?${query}`);
  },
};
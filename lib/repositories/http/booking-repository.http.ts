import { apiGet, apiPost } from "@/lib/api/client";
import type { BookingListResult, CreatedBooking } from "@/lib/api/types";
import type { BookingStatus } from "@/lib/api/types";
import type { BookingRepository, ListBookingsParams } from "../booking-repository";

type ApiBookingStatus = "PENDING" | "PAID" | "COMPLETED" | "CANCELED";

const toApiStatus: Record<BookingStatus, ApiBookingStatus> = {
  PENDIENTE: "PENDING",
  PAGADA: "PAID",
  FINALIZADA: "COMPLETED",
  CANCELADA: "CANCELED",
};

const fromApiStatus: Record<ApiBookingStatus, BookingStatus> = {
  PENDING: "PENDIENTE",
  PAID: "PAGADA",
  COMPLETED: "FINALIZADA",
  CANCELED: "CANCELADA",
};

type ApiBookingListResult = Omit<BookingListResult, "data"> & {
  data: Array<Omit<BookingListResult["data"][number], "status"> & { status: ApiBookingStatus }>;
};

function fromApiBooking<T extends { status: ApiBookingStatus }>(booking: T) {
  return { ...booking, status: fromApiStatus[booking.status] };
}

function fromApiList(result: ApiBookingListResult): BookingListResult {
  return { ...result, data: result.data.map(fromApiBooking) };
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return search.toString();
}

export const httpBookingRepository: BookingRepository = {
  async create(input) {
    const booking = await apiPost<Omit<CreatedBooking, "status"> & { status: ApiBookingStatus }>(
      "api/v1/bookings",
      input,
    );
    return fromApiBooking(booking);
  },

  async listMine({ page, status }: ListBookingsParams) {
    const query = buildQuery({ page, status: status ? toApiStatus[status] : undefined, pageSize: 10 });
    return fromApiList(await apiGet<ApiBookingListResult>(`api/v1/bookings/mine?${query}`));
  },

  async listLessor({ page, status, propertyId }: ListBookingsParams) {
    const query = buildQuery({ page, status: status ? toApiStatus[status] : undefined, propertyId, pageSize: 10 });
    return fromApiList(await apiGet<ApiBookingListResult>(`api/v1/lessor/bookings?${query}`));
  },
};

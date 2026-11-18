import { apiGet, apiPost } from "@/lib/api/client";
import type { BookingListItem, BookingListResult, CreatedBooking, PropertyCategory } from "@/lib/api/types";
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

type ApiBookingItem = {
  id: string;
  status: ApiBookingStatus;
  propertyId?: string;
  propertyTitle?: string;
  propertyCategory?: PropertyCategory;
  property?: { id?: string; title?: string; name?: string; category?: string };
  tenant?: { name?: string };
  startDate: string;
  endDate: string;
  days: number;
  subtotal: string;
  expiresAt?: string | null;
  cancelReason?: "VENCIDA" | null;
  deliveredAt?: string | null;
  returnedAt?: string | null;
  finalizedAt?: string | null;
  ratedByMe?: boolean;
  lesseeName?: string;
};

type ApiBookingListResult = {
  data: ApiBookingItem[];
  total: number;
  page: number;
  pageSize?: number;
  totalPages?: number;
};

const BOOKING_PAGE_SIZE = 10;

const fromApiCategory: Record<string, PropertyCategory> = {
  PROPERTY: "PROPIEDAD",
  EQUIPMENT: "EQUIPO",
  PROPIEDAD: "PROPIEDAD",
  EQUIPO: "EQUIPO",
};

function fromApiBooking<T extends { status: ApiBookingStatus }>(booking: T) {
  return { ...booking, status: fromApiStatus[booking.status] };
}

function fromApiList(result: ApiBookingListResult): BookingListResult {
  const pageSize = result.pageSize ?? BOOKING_PAGE_SIZE;
  return {
    data: result.data.map((item) => {
      const normalized: Omit<ApiBookingItem, "status"> & { status: BookingStatus } = {
        ...item,
        status: fromApiStatus[item.status],
      };
      return {
        ...normalized,
        propertyId: item.propertyId ?? item.property?.id ?? "",
        propertyTitle: item.propertyTitle ?? item.property?.title ?? item.property?.name ?? "",
        propertyCategory: item.propertyCategory ?? (item.property?.category ? fromApiCategory[item.property.category] : undefined),
        lesseeName: item.lesseeName ?? item.tenant?.name,
      } as BookingListItem;
    }),
    total: result.total,
    page: result.page,
    totalPages: result.totalPages ?? Math.max(1, Math.ceil(result.total / pageSize)),
  };
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
    const query = buildQuery({ page, status: status ? toApiStatus[status] : undefined, pageSize: BOOKING_PAGE_SIZE });
    return fromApiList(await apiGet<ApiBookingListResult>(`api/v1/bookings/mine?${query}`));
  },

  async listLessor({ page, status, propertyId }: ListBookingsParams) {
    const query = buildQuery({ page, status: status ? toApiStatus[status] : undefined, propertyId, pageSize: BOOKING_PAGE_SIZE });
    return fromApiList(await apiGet<ApiBookingListResult>(`api/v1/owner/bookings?${query}`));
  },
};

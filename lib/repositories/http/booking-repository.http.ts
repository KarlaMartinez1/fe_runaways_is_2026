import { apiGet, apiPost } from "@/lib/api/client";
import type { BookingListItem, BookingListResult, CreatedBooking, PropertyCategory } from "@/lib/api/types";
import type { BookingStatus } from "@/lib/api/types";
import type { BookingRepository, ListBookingsParams } from "../booking-repository";
import { countBookingDays } from "@/lib/bookings/rules";

type ApiBookingStatus = "PENDING" | "PAID" | "COMPLETED" | "CANCELED";

const toApiStatus: Record<string, ApiBookingStatus> = {
  PENDIENTE: "PENDING",
  PAGADA: "PAID",
  FINALIZADA: "COMPLETED",
  CANCELADA: "CANCELED",
  PENDING: "PENDING",
  PAID: "PAID",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
};

const fromApiStatus: Record<string, BookingStatus> = {
  PENDING: "PENDIENTE",
  PAID: "PAGADA",
  COMPLETED: "FINALIZADA",
  CANCELED: "CANCELADA",
  PENDIENTE: "PENDIENTE",
  PAGADA: "PAGADA",
  FINALIZADA: "FINALIZADA",
  CANCELADA: "CANCELADA",
};

type ApiBookingItem = {
  id: string;
  status: ApiBookingStatus;
  propertyId?: string;
  propertyTitle?: string;
  propertyCategory?: PropertyCategory;
  property?: { id?: string; title?: string; name?: string; category?: string };
  tenant?: { id?: string; userId?: string; name?: string; rating?: { average?: number | null; count?: number } };
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
  tenantId?: string;
  tenant?: { id?: string; userId?: string; name?: string; rating?: { average?: number | null; count?: number } };
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

function mapBookingItem(raw: ApiBookingItem): BookingListItem {
  return {
    id: raw.id,
    propertyId: raw.propertyId ?? raw.property?.id ?? "",
    propertyTitle: raw.propertyTitle || raw.property?.title || "Bien en renta",
    startDate: raw.startDate,
    endDate: raw.endDate,
    days: raw.days || countBookingDays(raw.startDate, raw.endDate),
    subtotal: raw.subtotal,
    status: fromApiStatus[raw.status] || "PENDIENTE",
    expiresAt: raw.expiresAt || null,
    cancelReason: raw.cancelReason || (raw.status === "CANCELED" ? "VENCIDA" : null),
    deliveredAt: raw.deliveredAt || null,
    returnedAt: raw.returnedAt || null,
    lesseeName: raw.lesseeName || raw.tenant?.name,
    lesseeId: raw.tenantId ?? raw.tenant?.id ?? raw.tenant?.userId,
    lesseeRatingAverage: raw.tenant?.rating?.average,
    lesseeRatingCount: raw.tenant?.rating?.count,
    finalizedAt: raw.finalizedAt || null,
    ratedByMe: raw.ratedByMe || false,
  };
}

type ApiCreatedBooking = Omit<CreatedBooking, "status"> & { status: ApiBookingStatus };

function fromApiBooking(raw: ApiCreatedBooking): CreatedBooking {
  return {
    ...raw,
    status: fromApiStatus[raw.status] || "PENDIENTE",
  };
}

function fromApiList(result: ApiBookingListResult): BookingListResult {
  const pageSize = result.pageSize ?? BOOKING_PAGE_SIZE;
  return {
    data: result.data.map((item) => mapBookingItem({
      ...item,
      propertyId: item.propertyId ?? item.property?.id ?? "",
      propertyTitle: item.propertyTitle ?? item.property?.title ?? item.property?.name ?? "",
      propertyCategory: item.propertyCategory ?? (item.property?.category ? fromApiCategory[item.property.category] : undefined),
      lesseeName: item.lesseeName ?? item.tenant?.name,
    })),
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
    const booking = await apiPost<ApiCreatedBooking>(
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

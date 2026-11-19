import { apiGet, apiPost } from "@/lib/api/client";
import type { BookingListItem, BookingListResult, BookingStatus, CreatedBooking } from "@/lib/api/types";
import type { BookingRepository, ListBookingsParams } from "../booking-repository";

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

function calculateDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

interface RawBackendBooking {
  id: string;
  propertyId: string;
  tenantId?: string;
  startDate: string;
  endDate: string;
  subtotal: string;
  status: string;
  expiresAt?: string | null;
  propertyTitle?: string;
  days?: number;
  cancelReason?: "VENCIDA" | null;
  deliveredAt?: string | null;
  returnedAt?: string | null;
  finalizedAt?: string | null;
  ratedByMe?: boolean;
  lesseeName?: string;
  property?: {
    title: string;
    securityDeposit?: string;
  };
  tenant?: {
    name?: string;
    email?: string;
  };
}

function mapBookingItem(raw: RawBackendBooking): BookingListItem {
  return {
    id: raw.id,
    propertyId: raw.propertyId,
    propertyTitle: raw.propertyTitle || raw.property?.title || "Bien en renta",
    startDate: raw.startDate,
    endDate: raw.endDate,
    days: raw.days || calculateDays(raw.startDate, raw.endDate),
    subtotal: raw.subtotal,
    status: fromApiStatus[raw.status] || "PENDIENTE",
    expiresAt: raw.expiresAt || null,
    cancelReason: raw.cancelReason || (raw.status === "CANCELED" ? "VENCIDA" : null),
    deliveredAt: raw.deliveredAt || null,
    returnedAt: raw.returnedAt || null,
    lesseeName: raw.lesseeName || raw.tenant?.name,
    finalizedAt: raw.finalizedAt || null,
    ratedByMe: raw.ratedByMe || false,
  };
}

function fromApiBooking<T extends { status: ApiBookingStatus }>(booking: T): T & { status: BookingStatus } {
  return { ...booking, status: fromApiStatus[booking.status] || "PENDIENTE" };
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

  async listMine({ page, status }: ListBookingsParams): Promise<BookingListResult> {
    const backendStatus = status ? toApiStatus[status] || status : undefined;
    const query = buildQuery({ page, status: backendStatus, pageSize: 10 });
    const rawResult = await apiGet<{ data: RawBackendBooking[]; total: number; page: number }>(
      `api/v1/bookings/mine?${query}`
    );
    const total = rawResult?.total || 0;
    return {
      data: (rawResult?.data || []).map(mapBookingItem),
      page: rawResult?.page || page,
      totalPages: Math.max(1, Math.ceil(total / 10)),
      total,
    };
  },

  async listLessor({ page, status, propertyId }: ListBookingsParams): Promise<BookingListResult> {
    const backendStatus = status ? toApiStatus[status] || status : undefined;
    const query = buildQuery({ page, status: backendStatus, propertyId, pageSize: 10 });
    const rawResult = await apiGet<{ data: RawBackendBooking[]; total: number; page: number }>(
      `api/v1/owner/bookings?${query}`
    );
    const total = rawResult?.total || 0;
    return {
      data: (rawResult?.data || []).map(mapBookingItem),
      page: rawResult?.page || page,
      totalPages: Math.max(1, Math.ceil(total / 10)),
      total,
    };
  },
};

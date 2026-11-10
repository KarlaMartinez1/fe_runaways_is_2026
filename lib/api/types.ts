export type PropertyCategory = "PROPIEDAD" | "EQUIPO";

export type PropertyStatus = "DISPONIBLE" | "PAUSADO" | "ELIMINADO";

export type Property = {
  id: string;
  title: string;
  category: PropertyCategory;
  department: string;
  municipality: string;
  pricePerDay: string;
  images: string[];
  status: PropertyStatus;
  createdAt: string;
  averageRating?: number | null;
};

export type Paginated<T> = {
  data: T[];
  page: number;
  totalPages: number;
  total: number;
};

export type PropertyDetail = Property & {
  description: string;
  securityDeposit: string;
  ownerName: string;
  reviewCount: number;
};

export type PropertyAvailability = {
  propertyId: string;
  from: string;
  to: string;
  occupiedDates: string[];
};

export type PropertyAvailabilityState =
  | { status: "ready"; from: string; to: string; occupiedDates: string[] }
  | { status: "unavailable" }
  | { status: "error" }
  | { status: "hidden" };

export type AccountStatus = "SIN_VERIFICAR" | "PENDIENTE" | "VERIFICADA" | "RECHAZADA";

export type ProfileDocument = {
  accountStatus: AccountStatus;
};

export type PropertyFilters = {
  q?: string;
  department?: string;
  municipality?: string;
  category?: PropertyCategory;
  noDeposit?: boolean;
};

export type BookingStatus = "PENDIENTE" | "PAGADA" | "FINALIZADA" | "CANCELADA";

export type CreatedBooking = {
  id: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  days: number;
  pricePerDay: string;
  subtotal: string;
  status: BookingStatus;
  expiresAt: string;
};

// Elemento de GET /api/v1/bookings/mine y GET /api/v1/lessor/bookings.
// Supuesto: el backend devuelve el título del bien y, en la vista del arrendador, el nombre del arrendatario.
export type BookingListItem = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  startDate: string;
  endDate: string;
  days: number;
  subtotal: string;
  status: BookingStatus;
  expiresAt: string | null;
  cancelReason: "VENCIDA" | null;
  deliveredAt: string | null;
  returnedAt: string | null;
  lesseeName?: string;
};

export type BookingListResult = Paginated<BookingListItem>;

export type NoAvailabilityBlock = {
  id: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  createdAt: string;
};
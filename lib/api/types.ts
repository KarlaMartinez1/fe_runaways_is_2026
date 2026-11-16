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
  ownerAverageRating?: number | null;
  ownerReviewCount?: number;
  propertyReviews?: ReviewListItem[];
};

export type ReviewListItem = {
  id: string;
  reviewerName: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
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
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
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
  finalizedAt?: string | null;
  ratedByMe?: boolean;
};

export type BookingListResult = Paginated<BookingListItem>;

export type NoAvailabilityBlock = {
  id: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  createdAt: string;
};

// Cuerpo de POST /api/v1/properties (H1). Los montos van como texto con 2 decimales
// y las fotos como URLs ya subidas a Firebase Storage.
export type NewPropertyInput = {
  title: string;
  description: string;
  category: PropertyCategory;
  department: string;
  municipality: string;
  address: string;
  pricePerDay: string;
  securityDeposit: string;
  images: string[];
};

// H4: bien del arrendador en "Mis publicaciones" y en la pantalla de gestión.
// Incluye la dirección exacta, que solo ve el dueño.
export type OwnerProperty = PropertyDetail & {
  address: string;
};

// Cuerpo de PUT /api/v1/properties/:id (H4): los mismos campos de H1 para reemplazo integral.
// images es la lista final de fotos (las que se conservan más las nuevas ya subidas).
export type UpdatePropertyInput = NewPropertyInput;

export type ReviewBlockReason = "NOT_FINALIZED" | "ALREADY_REVIEWED" | "WINDOW_CLOSED";

// Reserva con los datos necesarios para la pantalla "Calificar mi renta".
export type ReservationForReview = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string | null;
  startDate: string;
  endDate: string;
  days: number;
  subtotal: string;
  securityDeposit: string;
  status: BookingStatus;
  finalizedAt: string | null;
  ratedByMe: boolean;
};

// Cuerpo de POST /api/v1/reservations/:id/reviews/property.
export type PropertyReviewInput = {
  propertyRating: number;
  userRating: number;
  comment?: string;
};

// Resultado de publicar una reseña de bien.
export type PropertyReviewResult = {
  propertyId: string;
  averageRating: number | null;
  reviewCount: number;
  createdAt: string;
};

// Respuesta de PATCH /api/v1/properties/:id/status (H5).
export type PropertyStatusChange = {
  id: string;
  status: PropertyStatus;
  statusChangedAt: string;
};

export type BackendRoleChangeResponse = {
  userId: string;
  previousRole: "TENANT" | "OWNER" | "ADMIN";
  role: "TENANT" | "OWNER" | "ADMIN";
  changedAt: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type BackendUserResponse = {
  id: string;
  email: string;
  role: "TENANT" | "OWNER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
};

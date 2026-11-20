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
  // H4: solo en "Mis publicaciones"; "0.00" significa sin depósito.
  securityDeposit?: string;
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
  | { status: "error" };

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
  propertyCategory?: PropertyCategory;
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

// Campos de texto de un bien (H1 y H4). Los montos van como texto con 2 decimales.
type PropertyFields = {
  title: string;
  description: string;
  category: PropertyCategory;
  department: string;
  municipality: string;
  address: string;
  pricePerDay: string;
  securityDeposit: string;
};

// Cuerpo de POST /api/v1/properties (H1): multipart/form-data con los archivos en "images".
export type NewPropertyInput = PropertyFields & {
  images: File[];
};

// H4: bien del arrendador en "Mis publicaciones" y en la pantalla de gestión.
// Incluye la dirección exacta, que solo ve el dueño.
export type OwnerProperty = PropertyDetail & {
  address: string;
};

// Cuerpo de PUT /api/v1/properties/:id (H4): los mismos campos de H1 para reemplazo integral.
// Va como multipart/form-data: imagesToRemove son las URLs que se quitan e images los archivos nuevos.
export type UpdatePropertyInput = PropertyFields & {
  imagesToRemove: string[];
  images: File[];
};

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

// H19: tipo de documento de identidad.
export type DocumentType = "DUI" | "PASSPORT";

// H19: respuesta de GET /api/v1/profile/document.
export type IdentityDocumentInfo = ProfileDocument & {
  documentType?: DocumentType;
  documentSubmittedAt?: string;
  rejectionReason?: string;
};

// H19: datos para POST /api/v1/profile/document (se envían como multipart/form-data).
export type IdentityDocumentInput = {
  documentType: DocumentType;
  documentNumber: string;
  file: File;
};

// H19: respuesta 201 de POST /api/v1/profile/document.
export type SubmittedIdentityDocument = {
  documentType: DocumentType;
  documentStatus: "PENDIENTE";
  documentSubmittedAt: string;
};

export type BackendSubmittedIdentityDocument = {
  documentType: DocumentType;
  documentStatus: "PENDING";
  documentSubmittedAt: string;
};

// Contrato de GET /api/v1/profile/document. Los estados del backend se
// convierten al modelo de interfaz dentro del repositorio HTTP.
export type BackendIdentityDocumentInfo = {
  accountStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  documentType?: DocumentType;
  documentSubmittedAt?: string;
  rejectionReason?: string;
};

// H20: estado del documento en la revisión del ADMIN.
export type IdentityDocumentStatus = "PENDIENTE" | "APROBADO" | "RECHAZADO";

// H20: elemento de GET /api/v1/profile/document/admin.
export type PendingIdentityDocument = {
  userId: string;
  name: string;
  email: string;
  documentType: DocumentType;
  documentNumber: string;
  documentSubmittedAt: string;
};

// H20: respuesta de GET /api/v1/profile/document/admin.
export type PendingIdentityDocumentList = {
  data: PendingIdentityDocument[];
  total: number;
  page: number;
};

// H20: respuesta de GET /api/v1/profile/document/admin/:userId.
// fileUrl es un enlace firmado válido por 5 minutos (expiresAt).
export type IdentityDocumentReview = PendingIdentityDocument & {
  documentStatus: IdentityDocumentStatus;
  fileUrl: string;
  expiresAt: string;
};

// H20: respuesta de PATCH .../approve y .../reject.
export type IdentityDocumentDecision = {
  userId: string;
  documentStatus: IdentityDocumentStatus;
  isVerified?: boolean;
  rejectionReason?: string;
  reviewedAt: string;
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

export type BackendProfileDocument = {
  type: string;
  number: string;
  status: string;
};

export type BackendProfileRating = {
  average: number | null;
  count: number;
};

export type BackendProfileResponse = {
  userId: string;
  name: string;
  email: string;
  role: "TENANT" | "OWNER" | "ADMIN";
  isVerified: boolean;
  document: BackendProfileDocument | null;
  rating: BackendProfileRating;
  createdAt?: string;
};

export type BackendUserResponse = {
  id: string;
  email: string;
  role: "TENANT" | "OWNER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
};

// H15: reserva del arrendatario con ese bien, si existe (se muestra en el encabezado del chat).
export type ConversationBooking = {
  startDate: string;
  endDate: string;
  status: BookingStatus;
};

// H15: elemento de GET /api/v1/conversations (un hilo por bien y arrendatario).
// Supuesto: el backend devuelve el título del bien, el nombre de la otra persona y el último mensaje.
export type ConversationSummary = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  otherParticipantName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastMessageIsMine: boolean;
  unreadCount: number;
  booking: ConversationBooking | null;
};

// H15: mensaje de GET y POST /api/v1/conversations/:id/messages.
export type ChatMessage = {
  id: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
};

export type NotificationStatus = "UNREAD" | "READ";

export type NotificationCategory =
  | "MESSAGING"
  | "BOOKING"
  | "PAYMENT"
  | "VERIFICATION";

export type BackendPaymentSummary = {
  bookingId: string;
  propertyTitle: string;
  startDate: string;
  endDate: string;
  days: number;
  pricePerDay: string;
  rentalAmount: string;
  depositAmount: string;
  totalAmount: string;
  expiresAt: string;
};

export type CreatePaymentInput = {
  bookingId: string;
  last4Digits: string;
};

export type BackendPaymentReceipt = {
  receiptNumber: string;
  bookingId: string;
  paymentDate: string;
  propertyTitle: string;
  startDate: string;
  endDate: string;
  days: number;
  pricePerDay: string;
  rentalAmount: string;
  depositAmount: string;
  totalAmount: string;
  last4Digits: string;
};

// H14: Decisión y gestión del depósito de garantía
export type DepositDecisionType = "DEVOLVER" | "RETENER";

export type CreateDepositDecisionInput = {
  decisionType: DepositDecisionType;
  retentionAmount?: string;
  retentionReason?: string;
};

export type BackendDepositStatus =
  | "PENDING"
  | "RETURNED"
  | "RETAINED"
  | "PARTIALLY_RETAINED";

export type BackendDepositDecisionResponse = {
  id: string;
  bookingId: string;
  state: BackendDepositStatus;
  amount: string;
  retainedAmount: string;
  returnedAmount: string;
  decidedAt: string;
};

export type BackendDepositDetail = {
  id: string;
  amount: string;
  state: BackendDepositStatus;
  retainedAmount: string;
  returnedAmount: string;
  decidedAt: string | null;
};

export type BackendTransactionItem = {
  id: string;
  type: "COBRO" | "DEVOLUCION" | "RETENCION";
  amount: string;
  reason: string;
  createdAt: string;
};

export type BackendTransactionHistoryResponse = {
  bookingId: string;
  data: BackendTransactionItem[];
};


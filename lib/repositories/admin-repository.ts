import type {
  IdentityDocumentDecision,
  IdentityDocumentReview,
  PendingIdentityDocumentList,
} from "@/lib/api/types";

export const ADMIN_DOCUMENTS_PAGE_SIZE = 10;

// H20: revisión de documentos de identidad (solo ADMIN).
export interface AdminRepository {
  // Documentos PENDIENTE, del más antiguo al más reciente, 10 por página.
  listPendingDocuments(page: number): Promise<PendingIdentityDocumentList>;
  // Documento de un usuario con su archivo. null si no existe.
  getDocument(userId: string): Promise<IdentityDocumentReview | null>;
  approveDocument(userId: string): Promise<IdentityDocumentDecision>;
  rejectDocument(userId: string, reason: string): Promise<IdentityDocumentDecision>;
}
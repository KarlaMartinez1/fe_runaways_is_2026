import type {
  IdentityDocumentInfo,
  IdentityDocumentInput,
  SubmittedIdentityDocument,
} from "@/lib/api/types";

// H19: documento de identidad del usuario en sesión.
export interface IdentityDocumentRepository {
  // GET /api/v1/profile/document: estado de la cuenta y datos del último documento.
  getMine(): Promise<IdentityDocumentInfo>;
  // POST /api/v1/profile/document: envía un documento nuevo (queda PENDIENTE).
  submit(input: IdentityDocumentInput): Promise<SubmittedIdentityDocument>;
}
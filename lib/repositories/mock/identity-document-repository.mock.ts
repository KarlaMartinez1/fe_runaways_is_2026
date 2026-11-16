import { ApiError } from "@/lib/api/client";
import { getCurrentUser } from "@/lib/api/auth";
import type { AccountStatus, DocumentType } from "@/lib/api/types";
import { identityDocumentMessages } from "@/lib/messages/identity-document";
import { getDocumentFileError } from "@/lib/validations/identity-document";
import type { IdentityDocumentRepository } from "../identity-document-repository";

type DocumentStatus = "PENDIENTE" | "APROBADO" | "RECHAZADO";

// Documento guardado en memoria (se pierde al reiniciar el servidor de desarrollo).
export type StoredIdentityDocument = {
  userId: string;
  name: string;
  email: string;
  documentType: DocumentType;
  documentNumber: string;
  fileName: string;
  fileType: string;
  // Data URL del archivo, para que el ADMIN lo vea en la revisión (H20).
  fileUrl: string;
  status: DocumentStatus;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
};

// Último documento de cada usuario, por id de usuario.
export const mockIdentityDocuments = new Map<string, StoredIdentityDocument>();

const accountStatusByDocument: Record<DocumentStatus, AccountStatus> = {
  PENDIENTE: "PENDIENTE",
  APROBADO: "VERIFICADA",
  RECHAZADO: "RECHAZADA",
};

// El backend identifica al usuario por su token; aquí se usa la sesión de prueba.
async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401);
  if (user.role === "ADMIN") throw new ApiError(403);
  return user;
}

export const mockIdentityDocumentRepository: IdentityDocumentRepository = {
  async getMine() {
    const user = await requireUser();
    const document = mockIdentityDocuments.get(user.id);
    if (!document) {
      return { accountStatus: "SIN_VERIFICAR" };
    }
    return {
      accountStatus: accountStatusByDocument[document.status],
      documentType: document.documentType,
      documentSubmittedAt: document.submittedAt,
      rejectionReason: document.rejectionReason,
    };
  },

  async submit(input) {
    const user = await requireUser();

    const current = mockIdentityDocuments.get(user.id);
    if (current && current.status !== "RECHAZADO") {
      throw new ApiError(409, undefined, identityDocumentMessages.alreadySubmitted);
    }

    const fileError = getDocumentFileError(input.file);
    if (fileError) {
      throw new ApiError(400, undefined, fileError);
    }

    const bytes = Buffer.from(await input.file.arrayBuffer()).toString("base64");
    const submittedAt = new Date().toISOString();

    mockIdentityDocuments.set(user.id, {
      userId: user.id,
      name: user.name ?? user.email,
      email: user.email,
      documentType: input.documentType,
      documentNumber: input.documentNumber,
      fileName: input.file.name,
      fileType: input.file.type,
      fileUrl: `data:${input.file.type};base64,${bytes}`,
      status: "PENDIENTE",
      submittedAt,
    });

    return {
      documentType: input.documentType,
      documentStatus: "PENDIENTE",
      documentSubmittedAt: submittedAt,
    };
  },
};
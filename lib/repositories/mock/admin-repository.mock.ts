import { ApiError } from "@/lib/api/client";
import { getCurrentUser } from "@/lib/api/auth";
import type { IdentityDocumentReview, PendingIdentityDocument } from "@/lib/api/types";
import { adminDocumentsMessages } from "@/lib/messages/admin-documents";
import { isValidRejectionReason } from "@/lib/validations/document-review";
import { ADMIN_DOCUMENTS_PAGE_SIZE, type AdminRepository } from "../admin-repository";
import {
  mockIdentityDocuments,
  type StoredIdentityDocument,
} from "./identity-document-repository.mock";

// Imagen de prueba para los documentos de ejemplo (un rectángulo con el texto "Documento de prueba").
const SAMPLE_FILE_URL = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380"><rect width="600" height="380" rx="24" fill="#e5ebfb"/><text x="300" y="200" font-family="sans-serif" font-size="28" text-anchor="middle" fill="#2449c6">Documento de prueba</text></svg>',
)}`;

// Documentos pendientes de ejemplo (los del Figma). Los que suben los usuarios en H19 se suman a estos.
const sampleDocuments: Omit<StoredIdentityDocument, "fileName" | "fileType" | "fileUrl" | "status">[] = [
  { userId: "sample-andrea", name: "Andrea Flores", email: "andrea.flores@correo.com", documentType: "DUI", documentNumber: "01234567-8", submittedAt: "2026-10-28T15:12:00Z" },
  { userId: "sample-kevin", name: "Kevin Morales", email: "kevin.morales@correo.com", documentType: "PASSPORT", documentNumber: "B1234567", submittedAt: "2026-10-29T22:40:00Z" },
  { userId: "sample-sofia", name: "Sofía Rivera", email: "sofia.rivera@correo.com", documentType: "DUI", documentNumber: "05432198-7", submittedAt: "2026-10-31T17:03:00Z" },
  { userId: "sample-diego", name: "Diego Pineda", email: "diego.pineda@correo.com", documentType: "DUI", documentNumber: "06789012-3", submittedAt: "2026-11-02T02:25:00Z" },
];

for (const sample of sampleDocuments) {
  if (!mockIdentityDocuments.has(sample.userId)) {
    mockIdentityDocuments.set(sample.userId, {
      ...sample,
      fileName: "documento.svg",
      fileType: "image/svg+xml",
      fileUrl: SAMPLE_FILE_URL,
      status: "PENDIENTE",
    });
  }
}

const FILE_URL_MINUTES = 5;

// El backend valida el rol con el token; aquí se usa la sesión de prueba.
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401);
  if (user.role !== "ADMIN") throw new ApiError(403);
}

function toPending(document: StoredIdentityDocument): PendingIdentityDocument {
  return {
    userId: document.userId,
    name: document.name,
    email: document.email,
    documentType: document.documentType,
    documentNumber: document.documentNumber,
    documentSubmittedAt: document.submittedAt,
  };
}

// Busca el documento pendiente de un usuario, con las reglas del backend (404 y 409).
function findPending(userId: string) {
  const document = mockIdentityDocuments.get(userId);
  if (!document) throw new ApiError(404);
  if (document.status !== "PENDIENTE") {
    throw new ApiError(409, undefined, adminDocumentsMessages.alreadyReviewed);
  }
  return document;
}

export const mockAdminRepository: AdminRepository = {
  async listPendingDocuments(page) {
    await requireAdmin();
    const pending = [...mockIdentityDocuments.values()]
      .filter((document) => document.status === "PENDIENTE")
      .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));

    const start = (page - 1) * ADMIN_DOCUMENTS_PAGE_SIZE;
    return {
      data: pending.slice(start, start + ADMIN_DOCUMENTS_PAGE_SIZE).map(toPending),
      total: pending.length,
      page,
    };
  },

  async getDocument(userId) {
    await requireAdmin();
    const document = mockIdentityDocuments.get(userId);
    if (!document) return null;

    const review: IdentityDocumentReview = {
      ...toPending(document),
      documentStatus: document.status,
      fileUrl: document.fileUrl,
      expiresAt: new Date(Date.now() + FILE_URL_MINUTES * 60_000).toISOString(),
    };
    return review;
  },

  async approveDocument(userId) {
    await requireAdmin();
    const document = findPending(userId);
    document.status = "APROBADO";
    document.reviewedAt = new Date().toISOString();
    document.rejectionReason = undefined;
    return {
      userId,
      documentStatus: "APROBADO",
      isVerified: true,
      reviewedAt: document.reviewedAt,
    };
  },

  async rejectDocument(userId, reason) {
    await requireAdmin();
    if (!isValidRejectionReason(reason)) {
      throw new ApiError(400, undefined, adminDocumentsMessages.reasonLength);
    }
    const document = findPending(userId);
    document.status = "RECHAZADO";
    document.rejectionReason = reason.trim();
    document.reviewedAt = new Date().toISOString();
    return {
      userId,
      documentStatus: "RECHAZADO",
      rejectionReason: document.rejectionReason,
      reviewedAt: document.reviewedAt,
    };
  },
};
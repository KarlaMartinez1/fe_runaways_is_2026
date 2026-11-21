import { ApiError, apiGet, apiPatch } from "@/lib/api/client";
import type {
  BackendDocumentType,
  BackendIdentityDocumentDecision,
  BackendIdentityDocumentReview,
  BackendIdentityDocumentStatus,
  BackendPendingIdentityDocumentList,
  IdentityDocumentStatus,
  DocumentType,
  IdentityDocumentDecision,
  IdentityDocumentReview,
  PendingIdentityDocumentList,
} from "@/lib/api/types";
import { ADMIN_DOCUMENTS_PAGE_SIZE, type AdminRepository } from "../admin-repository";

function toDocumentType(type: BackendDocumentType): DocumentType {
  return type;
}

function toDocumentStatus(status: BackendIdentityDocumentStatus): IdentityDocumentStatus {
  switch (status) {
    case "PENDING":
      return "PENDIENTE";
    case "APPROVED":
      return "APROBADO";
    case "REJECTED":
      return "RECHAZADO";
  }
}

export const httpAdminRepository: AdminRepository = {
  async listPendingDocuments(page) {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(ADMIN_DOCUMENTS_PAGE_SIZE),
    });
    const result = await apiGet<BackendPendingIdentityDocumentList>(
      `api/v1/profile/document/admin?${params.toString()}`,
    );
    return {
      ...result,
      data: result.data.map((item) => ({
        ...item,
        documentType: toDocumentType(item.documentType),
      })),
    } satisfies PendingIdentityDocumentList;
  },

  async getDocument(userId) {
    try {
      const result = await apiGet<BackendIdentityDocumentReview>(
        `api/v1/profile/document/admin/${encodeURIComponent(userId)}`,
      );
      return {
        ...result,
        documentType: toDocumentType(result.documentType),
        documentStatus: toDocumentStatus(result.documentStatus),
        fileUrl: result.documentUrl,
      } satisfies IdentityDocumentReview;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async approveDocument(userId) {
    const result = await apiPatch<BackendIdentityDocumentDecision, Record<string, never>>(
      `api/v1/profile/document/admin/${encodeURIComponent(userId)}/approve`,
      {},
    );
    return {
      ...result,
      documentStatus: toDocumentStatus(result.documentStatus),
    } satisfies IdentityDocumentDecision;
  },

  async rejectDocument(userId, reason) {
    const result = await apiPatch<BackendIdentityDocumentDecision, { rejectionReason: string }>(
      `api/v1/profile/document/admin/${encodeURIComponent(userId)}/reject`,
      { rejectionReason: reason },
    );
    return {
      ...result,
      documentStatus: toDocumentStatus(result.documentStatus),
    } satisfies IdentityDocumentDecision;
  },
};

import { ApiError, apiGet, apiPatch } from "@/lib/api/client";
import type {
  IdentityDocumentDecision,
  IdentityDocumentReview,
  PendingIdentityDocumentList,
} from "@/lib/api/types";
import { ADMIN_DOCUMENTS_PAGE_SIZE, type AdminRepository } from "../admin-repository";

export const httpAdminRepository: AdminRepository = {
  listPendingDocuments(page) {
    const params = new URLSearchParams({
      status: "PENDIENTE",
      page: String(page),
      pageSize: String(ADMIN_DOCUMENTS_PAGE_SIZE),
    });
    return apiGet<PendingIdentityDocumentList>(`api/v1/profile/document/admin?${params.toString()}`);
  },

  async getDocument(userId) {
    try {
      return await apiGet<IdentityDocumentReview>(
        `api/v1/profile/document/admin/${encodeURIComponent(userId)}`,
      );
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
        return null;
      }
      throw error;
    }
  },

  approveDocument(userId) {
    return apiPatch<IdentityDocumentDecision, Record<string, never>>(
      `api/v1/profile/document/admin/${encodeURIComponent(userId)}/approve`,
      {},
    );
  },

  rejectDocument(userId, reason) {
    return apiPatch<IdentityDocumentDecision, { reason: string }>(
      `api/v1/profile/document/admin/${encodeURIComponent(userId)}/reject`,
      { reason },
    );
  },
};
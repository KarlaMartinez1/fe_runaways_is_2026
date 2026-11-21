import { ApiError, apiGet } from "@/lib/api/client";
import { apiFetch } from "@/lib/api/server-client";
import type {
  BackendIdentityDocumentInfo,
  BackendSubmittedIdentityDocument,
  SubmittedIdentityDocument,
} from "@/lib/api/types";
import type { IdentityDocumentRepository } from "../identity-document-repository";

export const httpIdentityDocumentRepository: IdentityDocumentRepository = {
  getMine() {
    return apiGet<BackendIdentityDocumentInfo>("api/v1/profile/document").then((result) => ({
      ...result,
      accountStatus: ({
        UNVERIFIED: "SIN_VERIFICAR",
        PENDING: "PENDIENTE",
        VERIFIED: "VERIFICADA",
        REJECTED: "RECHAZADA",
      } as const)[result.accountStatus],
    }));
  },

  // El backend recibe multipart/form-data. Se usa apiFetch (fetch con la sesión)
  // porque los helpers de client.ts solo envían JSON.
  async submit(input) {
    const formData = new FormData();
    formData.append("documentType", input.documentType);
    formData.append("documentNumber", input.documentNumber);
    formData.append("documentUrl", input.file);

    const response = await apiFetch("api/v1/profile/document", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
      throw new ApiError(response.status, body.code, typeof message === "string" ? message : undefined);
    }

    const result = (await response.json()) as BackendSubmittedIdentityDocument;
    return {
      ...result,
      documentStatus: "PENDIENTE",
    } satisfies SubmittedIdentityDocument;
  },
};

import { ApiError, apiGet } from "@/lib/api/client";
import { apiFetch } from "@/lib/api/server-client";
import type { IdentityDocumentInfo, SubmittedIdentityDocument } from "@/lib/api/types";
import type { IdentityDocumentRepository } from "../identity-document-repository";

export const httpIdentityDocumentRepository: IdentityDocumentRepository = {
  getMine() {
    return apiGet<IdentityDocumentInfo>("api/v1/profile/document");
  },

  // El backend recibe multipart/form-data. Se usa apiFetch (fetch con la sesión)
  // porque los helpers de client.ts solo envían JSON.
  async submit(input) {
    const formData = new FormData();
    formData.append("documentType", input.documentType);
    formData.append("documentNumber", input.documentNumber);
    formData.append("file", input.file);

    const response = await apiFetch("api/v1/profile/document", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
      throw new ApiError(response.status, body.code, typeof message === "string" ? message : undefined);
    }

    return (await response.json()) as SubmittedIdentityDocument;
  },
};
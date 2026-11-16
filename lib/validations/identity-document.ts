import { z } from "zod";
import { identityDocumentMessages as m } from "@/lib/messages/identity-document";

export const DOCUMENT_TYPES = ["DUI", "PASAPORTE"] as const;
export const DOCUMENT_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
export const DOCUMENT_FILE_MAX_BYTES = 5 * 1024 * 1024;

const DUI_PATTERN = /^\d{8}-\d$/;
const PASSPORT_PATTERN = /^[A-Za-z0-9]{6,15}$/;

// H19: tipo y número del documento. El formato del número depende del tipo.
export const identityDocumentSchema = z
  .object({
    documentType: z.enum(DOCUMENT_TYPES, { message: m.typeRequired }),
    documentNumber: z.string().trim().min(1, m.numberRequired),
  })
  .superRefine((data, ctx) => {
    if (!data.documentNumber) return;
    if (data.documentType === "DUI" && !DUI_PATTERN.test(data.documentNumber)) {
      ctx.addIssue({ code: "custom", path: ["documentNumber"], message: m.duiFormat });
    }
    if (data.documentType === "PASAPORTE" && !PASSPORT_PATTERN.test(data.documentNumber)) {
      ctx.addIssue({ code: "custom", path: ["documentNumber"], message: m.passportFormat });
    }
  });

export type IdentityDocumentFormData = z.infer<typeof identityDocumentSchema>;

// Revisa el archivo: un solo JPG, PNG o PDF de máximo 5 MB. Devuelve el error o undefined.
export function getDocumentFileError(file: File | null | undefined) {
  if (!file || file.size === 0) return m.fileRequired;
  if (!DOCUMENT_FILE_TYPES.includes(file.type)) return m.fileType;
  if (file.size > DOCUMENT_FILE_MAX_BYTES) return m.fileSize;
  return undefined;
}
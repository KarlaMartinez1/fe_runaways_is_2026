import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { identityDocumentMessages as m } from "@/lib/messages/identity-document";
import { accountStatusDisplayLabels } from "@/lib/messages/profile";
import {
  DOCUMENT_FILE_MAX_BYTES,
  getDocumentFileError,
  identityDocumentSchema,
} from "@/lib/validations/identity-document";
import { VerificationStatusCard } from "./verification-status-card";

function numberErrors(documentType: string, documentNumber: string) {
  const result = identityDocumentSchema.safeParse({ documentType, documentNumber });
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

function fileOf(type: string, size: number) {
  const file = new File(["x"], "documento", { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("H19. Subir documento de identidad", () => {
  it("AC1: el tipo de documento y el número son obligatorios", () => {
    expect(numberErrors("", "12345678-9")).toContain(m.typeRequired);
    expect(numberErrors("DUI", "")).toContain(m.numberRequired);
  });

  it("AC1: el DUI usa el formato 00000000-0", () => {
    expect(numberErrors("DUI", "12345678-9")).toEqual([]);
    expect(numberErrors("DUI", "123456789")).toContain(m.duiFormat);
    expect(numberErrors("DUI", "1234-5678")).toContain(m.duiFormat);
  });

  it("AC1: el pasaporte lleva de 6 a 15 letras o números", () => {
    expect(numberErrors("PASSPORT", "A1234567")).toEqual([]);
    expect(numberErrors("PASSPORT", "A123")).toContain(m.passportFormat);
    expect(numberErrors("PASSPORT", "A1234567890123456")).toContain(m.passportFormat);
    expect(numberErrors("PASSPORT", "A12-345")).toContain(m.passportFormat);
  });

  it("AC2 y AC6: solo acepta un archivo JPG, PNG o PDF de máximo 5 MB", () => {
    expect(getDocumentFileError(fileOf("image/jpeg", 1024))).toBeUndefined();
    expect(getDocumentFileError(fileOf("image/png", 1024))).toBeUndefined();
    expect(getDocumentFileError(fileOf("application/pdf", DOCUMENT_FILE_MAX_BYTES))).toBeUndefined();
    expect(getDocumentFileError(fileOf("image/gif", 1024))).toBe(m.fileType);
    expect(getDocumentFileError(fileOf("application/pdf", DOCUMENT_FILE_MAX_BYTES + 1))).toBe(m.fileSize);
    expect(getDocumentFileError(null)).toBe(m.fileRequired);
  });

  it("AC3: después de enviar, el perfil muestra el estado Pendiente", () => {
    render(<VerificationStatusCard info={{ accountStatus: "PENDIENTE" }} showUploadNew={false} />);

    expect(screen.getByText(accountStatusDisplayLabels.PENDIENTE)).toBeInTheDocument();
    expect(screen.getByText(m.reviewInfo)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: m.uploadNew })).not.toBeInTheDocument();
  });

  it("AC4: si el documento fue rechazado, muestra el motivo y el botón Subir nuevo documento", async () => {
    const user = userEvent.setup();
    const onUploadNew = jest.fn();
    render(
      <VerificationStatusCard
        info={{ accountStatus: "RECHAZADA", rejectionReason: "La imagen está borrosa." }}
        onUploadNew={onUploadNew}
        showUploadNew
      />,
    );

    expect(screen.getByText(accountStatusDisplayLabels.RECHAZADA)).toBeInTheDocument();
    expect(screen.getByText("La imagen está borrosa.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: m.uploadNew }));
    expect(onUploadNew).toHaveBeenCalledTimes(1);
  });

  it("AC6: con la cuenta verificada no ofrece subir otro documento ni muestra los requisitos", () => {
    render(<VerificationStatusCard info={{ accountStatus: "VERIFICADA" }} showUploadNew={false} />);

    expect(screen.getByText(accountStatusDisplayLabels.VERIFICADA)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: m.uploadNew })).not.toBeInTheDocument();
    expect(screen.queryByText(m.requirementsTitle)).not.toBeInTheDocument();
  });
});
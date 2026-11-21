import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { adminDocumentsMessages as m } from "@/lib/messages/admin-documents";
import { isValidRejectionReason } from "@/lib/validations/document-review";
import { RejectDocumentDialog } from "./reject-document-dialog";

function renderDialog(props: Partial<Parameters<typeof RejectDocumentDialog>[0]> = {}) {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  render(
    <RejectDocumentDialog isOpen isLoading={false} onConfirm={onConfirm} onCancel={onCancel} {...props} />,
  );
  return { onConfirm, onCancel };
}

describe("H20. Revisión y aprobación de documentos", () => {
  it("AC2: el cuadro de rechazo solo aparece cuando se presiona Rechazar", () => {
    renderDialog({ isOpen: false });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("AC2: Confirmar rechazo queda deshabilitado mientras el motivo no tenga al menos 10 caracteres", async () => {
    const user = userEvent.setup();
    renderDialog();

    const confirm = screen.getByRole("button", { name: m.confirmReject });
    expect(confirm).toBeDisabled();

    await user.type(screen.getByLabelText(m.reasonLabel), "malo");
    expect(confirm).toBeDisabled();
    expect(screen.getByText(m.reasonLength)).toBeInTheDocument();
    expect(screen.getByText(m.reasonCounter(4))).toBeInTheDocument();
  });

  it("AC2: con un motivo válido se habilita y envía el motivo al confirmar", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();
    const reason = "La imagen está borrosa y no se lee el número.";

    await user.type(screen.getByLabelText(m.reasonLabel), reason);
    const confirm = screen.getByRole("button", { name: m.confirmReject });
    expect(confirm).toBeEnabled();
    expect(screen.queryByText(m.reasonLength)).not.toBeInTheDocument();

    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledWith(reason);
  });

  it("AC5: el motivo debe tener de 10 a 300 caracteres sin contar espacios al inicio o al final", () => {
    expect(isValidRejectionReason("a".repeat(10))).toBe(true);
    expect(isValidRejectionReason("a".repeat(300))).toBe(true);
    expect(isValidRejectionReason("a".repeat(9))).toBe(false);
    expect(isValidRejectionReason("a".repeat(301))).toBe(false);
    expect(isValidRejectionReason("    corto    ")).toBe(false);
  });

  it("AC5: el cuadro de texto no permite escribir más de 300 caracteres", () => {
    renderDialog();

    expect(screen.getByLabelText(m.reasonLabel)).toHaveAttribute("maxLength", "300");
  });

  it("AC2: se puede cancelar con el botón Cancelar o con Escape", async () => {
    const user = userEvent.setup();
    const { onCancel, onConfirm } = renderDialog();

    await user.click(screen.getByRole("button", { name: m.cancel }));
    await user.keyboard("{Escape}");

    expect(onCancel).toHaveBeenCalledTimes(2);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("AC2: mientras se envía el rechazo no permite cancelar", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderDialog({ isLoading: true });

    expect(screen.getByRole("button", { name: m.cancel })).toBeDisabled();
    await user.keyboard("{Escape}");
    expect(onCancel).not.toHaveBeenCalled();
  });
});
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmRefundModal } from "./confirm-refund-modal";
import { depositMessages } from "@/lib/messages/deposit";

describe("ConfirmRefundModal", () => {
  it("retorna null cuando isOpen es false", () => {
    const { container } = render(
      <ConfirmRefundModal
        isOpen={false}
        amount={50}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("muestra el diálogo con el monto formateado y ejecuta onConfirm u onCancel", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    render(
      <ConfirmRefundModal
        isOpen
        amount={75.5}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText("¿Devolver depósito de garantía?")
    ).toBeInTheDocument();
    expect(screen.getByText("$75.50")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmar devolución" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    await user.click(
      screen.getByRole("button", { name: depositMessages.cancelButton })
    );
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("cierra con tecla Escape y backdrop, pero los bloquea cuando isLoading es true", () => {
    const onCancel = jest.fn();
    const { container, rerender } = render(
      <ConfirmRefundModal
        isOpen
        amount={50}
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);

    const backdrop = container.querySelector('[aria-hidden="true"]');
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);
    expect(onCancel).toHaveBeenCalledTimes(2);

    rerender(
      <ConfirmRefundModal
        isOpen
        amount={50}
        onConfirm={jest.fn()}
        onCancel={onCancel}
        isLoading
      />
    );

    expect(
      screen.getByRole("button", { name: depositMessages.cancelButton })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Confirmar devolución" })
    ).toBeDisabled();

    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.click(container.querySelector('[aria-hidden="true"]')!);
    expect(onCancel).toHaveBeenCalledTimes(2);
  });
});

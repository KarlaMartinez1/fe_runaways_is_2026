import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RetainDepositForm } from "./retain-deposit-form";
import { depositMessages } from "@/lib/messages/deposit";

describe("RetainDepositForm", () => {
  it("muestra textos auxiliares según el monto ingresado (total, parcial y excedido)", async () => {
    const user = userEvent.setup();
    render(<RetainDepositForm depositAmount={50} />);

    expect(
      screen.getByText(depositMessages.fullRetentionHelper)
    ).toBeInTheDocument();

    const amountInput = screen.getByLabelText(
      depositMessages.retainAmountLabel
    ) as HTMLInputElement;

    await user.clear(amountInput);
    await user.type(amountInput, "20");
    expect(
      screen.getByText(depositMessages.differenceHelper(30))
    ).toBeInTheDocument();

    await user.clear(amountInput);
    await user.type(amountInput, "70");
    expect(
      screen.getByText(depositMessages.invalidAmountHelper)
    ).toBeInTheDocument();
  });

  it("valida monto positivo y longitud mínima del motivo con Zod", async () => {
    const user = userEvent.setup();
    const onSubmitSuccess = jest.fn();

    render(<RetainDepositForm depositAmount={50} onSubmitSuccess={onSubmitSuccess} />);

    const amountInput = screen.getByLabelText(depositMessages.retainAmountLabel);
    const reasonTextarea = screen.getByLabelText(depositMessages.retainReasonLabel);

    await user.clear(amountInput);
    await user.type(amountInput, "0");
    await user.type(reasonTextarea, "Corto");

    await user.click(
      screen.getByRole("button", { name: depositMessages.confirmRetentionButton })
    );

    expect(
      await screen.findByText("El monto a retener debe ser mayor a 0")
    ).toBeInTheDocument();
    expect(
      screen.getByText("El motivo de retención debe tener al menos 10 caracteres")
    ).toBeInTheDocument();
    expect(onSubmitSuccess).not.toHaveBeenCalled();
  });

  it("envía datos válidos, muestra estado de carga y feedback de éxito", async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void = () => {};
    const onSubmitSuccess = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        })
    );

    render(<RetainDepositForm depositAmount={50} onSubmitSuccess={onSubmitSuccess} />);

    const amountInput = screen.getByLabelText(depositMessages.retainAmountLabel);
    const reasonTextarea = screen.getByLabelText(depositMessages.retainReasonLabel);

    await user.clear(amountInput);
    await user.type(amountInput, "25");
    await user.type(reasonTextarea, "Rayadura visible en la carcasa");

    await user.click(
      screen.getByRole("button", { name: depositMessages.confirmRetentionButton })
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: depositMessages.submittingRetentionButton,
        })
      ).toBeDisabled();
    });

    await act(async () => {
      resolveSubmit();
    });

    expect(onSubmitSuccess).toHaveBeenCalledWith({
      amount: 25,
      reason: "Rayadura visible en la carcasa",
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      depositMessages.retentionSuccessNotice
    );
  });

  it("muestra error en alerta cuando falla el envío y resetea al cancelar", async () => {
    const user = userEvent.setup();
    const onSubmitSuccess = jest
      .fn()
      .mockRejectedValueOnce(new Error("El monto supera el depósito"))
      .mockRejectedValueOnce("error-no-instancia");
    const onCancel = jest.fn();

    render(
      <RetainDepositForm
        depositAmount={50}
        onSubmitSuccess={onSubmitSuccess}
        onCancel={onCancel}
      />
    );

    const reasonTextarea = screen.getByLabelText(
      depositMessages.retainReasonLabel
    ) as HTMLTextAreaElement;
    await user.type(reasonTextarea, "Daño comprobado en inspección");

    await user.click(
      screen.getByRole("button", { name: depositMessages.confirmRetentionButton })
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El monto supera el depósito"
    );

    await user.click(
      screen.getByRole("button", { name: depositMessages.confirmRetentionButton })
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      depositMessages.errorNotice
    );

    await user.click(
      screen.getByRole("button", { name: depositMessages.cancelButton })
    );
    expect(reasonTextarea.value).toBe("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

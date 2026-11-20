import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentMethodForm } from "./payment-method-form";
import { paymentFormMessages } from "@/lib/messages/payment";
import {
  PaymentGatewayError,
  processSimulatedPayment,
} from "@/lib/payments/gateway";
import type { BackendPaymentReceipt } from "@/lib/api/types";

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

jest.mock("@/lib/payments/gateway", () => {
  const actual = jest.requireActual<typeof import("@/lib/payments/gateway")>(
    "@/lib/payments/gateway"
  );
  return {
    ...actual,
    processSimulatedPayment: jest.fn(),
  };
});

const mockedProcessSimulatedPayment =
  processSimulatedPayment as jest.MockedFunction<typeof processSimulatedPayment>;

const futureExpiry = `12/${String((new Date().getFullYear() + 2) % 100).padStart(2, "0")}`;

const sampleReceipt: BackendPaymentReceipt = {
  receiptNumber: "REC-2026-001",
  bookingId: "booking-123",
  paymentDate: "2026-11-10T10:00:00Z",
  propertyTitle: "Proyector Epson 4K",
  startDate: "2026-11-15",
  endDate: "2026-11-17",
  days: 3,
  pricePerDay: "25.00",
  rentalAmount: "75.00",
  depositAmount: "30.00",
  totalAmount: "105.00",
  last4Digits: "4242",
};

async function fillValidCardForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    screen.getByLabelText(paymentFormMessages.cardHolderLabel),
    "Juan Pérez"
  );
  await user.type(
    screen.getByLabelText(paymentFormMessages.cardNumberLabel),
    "4111111111114242"
  );
  await user.type(
    screen.getByLabelText(paymentFormMessages.expiryDateLabel),
    futureExpiry
  );
  await user.type(screen.getByLabelText(paymentFormMessages.cvcLabel), "123");
}

describe("PaymentMethodForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renderiza los campos y botones del método de pago", () => {
    render(<PaymentMethodForm bookingId="booking-123" />);

    expect(
      screen.getByRole("heading", { name: paymentFormMessages.formTitle })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(paymentFormMessages.cardHolderLabel)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(paymentFormMessages.cardNumberLabel)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(paymentFormMessages.expiryDateLabel)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(paymentFormMessages.cvcLabel)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: paymentFormMessages.submitButton })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: paymentFormMessages.cancelButton })
    ).toBeInTheDocument();
  });

  it("muestra errores de validación de Zod cuando los campos son inválidos o vencidos", async () => {
    const user = userEvent.setup();
    render(<PaymentMethodForm bookingId="booking-123" />);

    await user.type(
      screen.getByLabelText(paymentFormMessages.cardHolderLabel),
      "Jo"
    );
    await user.type(
      screen.getByLabelText(paymentFormMessages.cardNumberLabel),
      "1234"
    );
    await user.type(
      screen.getByLabelText(paymentFormMessages.expiryDateLabel),
      "01/20"
    );
    await user.type(screen.getByLabelText(paymentFormMessages.cvcLabel), "1");

    await user.click(
      screen.getByRole("button", { name: paymentFormMessages.submitButton })
    );

    expect(
      await screen.findByText(paymentFormMessages.cardHolderMinError)
    ).toBeInTheDocument();
    expect(
      screen.getByText(paymentFormMessages.cardNumberRegexError)
    ).toBeInTheDocument();
    expect(
      screen.getByText(paymentFormMessages.expiryDateExpiredError)
    ).toBeInTheDocument();
    expect(screen.getByText(paymentFormMessages.cvcRegexError)).toBeInTheDocument();
    expect(mockedProcessSimulatedPayment).not.toHaveBeenCalled();
  });

  it("muestra error si falta bookingId sin invocar la pasarela", async () => {
    const user = userEvent.setup();
    render(<PaymentMethodForm />);

    await fillValidCardForm(user);
    await user.click(
      screen.getByRole("button", { name: paymentFormMessages.submitButton })
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(paymentFormMessages.missingBooking);
    expect(mockedProcessSimulatedPayment).not.toHaveBeenCalled();
  });

  it("muestra estado de envío, feedback de éxito y redirige al recibo", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });

    let resolvePayment: (value: BackendPaymentReceipt) => void = () => {};
    mockedProcessSimulatedPayment.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePayment = resolve;
        })
    );

    const onSuccess = jest.fn();
    render(
      <PaymentMethodForm
        bookingId="booking-123"
        endpointUrl="/api/pay-test"
        onSuccess={onSuccess}
      />
    );

    await fillValidCardForm(user);
    await user.click(
      screen.getByRole("button", { name: paymentFormMessages.submitButton })
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: paymentFormMessages.submittingButton })
      ).toBeDisabled();
    });
    expect(
      screen.getByLabelText(paymentFormMessages.cardHolderLabel)
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: paymentFormMessages.cancelButton })
    ).toBeDisabled();

    await act(async () => {
      resolvePayment(sampleReceipt);
    });

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent(paymentFormMessages.successFeedback);
    expect(mockedProcessSimulatedPayment).toHaveBeenCalledWith({
      bookingId: "booking-123",
      cardNumber: "4111111111114242",
      expiryDate: futureExpiry,
      cvc: "123",
      endpointUrl: "/api/pay-test",
    });
    expect(onSuccess).toHaveBeenCalledWith(
      {
        cardHolder: "Juan Pérez",
        cardNumber: "4111111111114242",
        expiryDate: futureExpiry,
        cvc: "123",
      },
      sampleReceipt
    );

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
    const pushedUrl = mockPush.mock.calls[0][0] as string;
    expect(pushedUrl).toContain("/receipt?");
    expect(pushedUrl).toContain("bookingId=booking-123");
    expect(pushedUrl).toContain("receiptNumber=REC-2026-001");
    expect(pushedUrl).toContain("last4=4242");
  });

  it("muestra mensajes de error ante PaymentGatewayError, Error y rechazo genérico", async () => {
    const user = userEvent.setup();
    mockedProcessSimulatedPayment.mockRejectedValueOnce(
      new PaymentGatewayError("INSUFFICIENT_FUNDS", paymentFormMessages.declinedFunds)
    );

    render(<PaymentMethodForm bookingId="booking-123" />);

    await fillValidCardForm(user);
    await user.click(
      screen.getByRole("button", { name: paymentFormMessages.submitButton })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      paymentFormMessages.declinedFunds
    );

    mockedProcessSimulatedPayment.mockRejectedValueOnce(new Error("Fallo de red"));
    await user.click(
      screen.getByRole("button", { name: paymentFormMessages.submitButton })
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Fallo de red");

    mockedProcessSimulatedPayment.mockRejectedValueOnce("unexpected-non-error");
    await user.click(
      screen.getByRole("button", { name: paymentFormMessages.submitButton })
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      paymentFormMessages.errorFeedback
    );
  });

  it("limpia el formulario e invoca onCancel o router.back al cancelar", async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    const { rerender } = render(
      <PaymentMethodForm bookingId="booking-123" onCancel={onCancel} />
    );

    const holderInput = screen.getByLabelText(
      paymentFormMessages.cardHolderLabel
    ) as HTMLInputElement;
    await user.type(holderInput, "María López");
    expect(holderInput.value).toBe("María López");

    await user.click(
      screen.getByRole("button", { name: paymentFormMessages.cancelButton })
    );

    expect(holderInput.value).toBe("");
    expect(onCancel).toHaveBeenCalledTimes(1);

    rerender(<PaymentMethodForm bookingId="booking-123" />);
    await user.click(
      screen.getByRole("button", { name: paymentFormMessages.cancelButton })
    );
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});

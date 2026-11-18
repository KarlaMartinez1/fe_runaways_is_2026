import { paymentFormMessages } from "@/lib/messages/payment";
import type { BackendPaymentReceipt, CreatePaymentInput } from "@/lib/api/types";

export interface SimulatedPaymentParams {
  bookingId: string;
  cardNumber: string;
  expiryDate?: string;
  cvc?: string;
  endpointUrl?: string;
}

export class PaymentGatewayError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "PaymentGatewayError";
  }
}

/**
 * Pasarela de pago simulada según especificación de AGENTS.md:
 * - Espera 2 segundos.
 * - Decide por los últimos 4 dígitos:
 *   - 4242: aprueba y realiza la llamada a POST /payments (http://localhost:3000/payments).
 *   - 0002: rechaza con "Fondos insuficientes. Intenta con otra tarjeta".
 *   - cualquier otra: rechaza con "Tarjeta no válida".
 * - Solo llama a POST /payments cuando aprueba.
 * - No se guarda ni se envía el número completo de la tarjeta ni el CVC.
 */
export async function processSimulatedPayment({
  bookingId,
  cardNumber,
  endpointUrl = "/payments",
}: SimulatedPaymentParams): Promise<BackendPaymentReceipt> {
  const cleanCardNumber = cardNumber.replace(/\s+/g, "");
  const last4Digits = cleanCardNumber.slice(-4);

  // Espera 2 segundos requeridos por la especificación
  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (last4Digits === "0002") {
    throw new PaymentGatewayError(
      "INSUFFICIENT_FUNDS",
      paymentFormMessages.declinedFunds
    );
  }

  if (last4Digits !== "4242") {
    throw new PaymentGatewayError(
      "INVALID_CARD",
      paymentFormMessages.invalidCard
    );
  }

  // Solo cuando aprueba (4242), realiza la llamada HTTP enviando únicamente bookingId y last4Digits
  const payload: CreatePaymentInput = {
    bookingId,
    last4Digits,
  };

  const response = await fetch(endpointUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data.message === "string"
        ? data.message
        : Array.isArray(data.message)
          ? data.message.join(", ")
          : paymentFormMessages.errorFeedback;

    throw new PaymentGatewayError(data.code || "PAYMENT_FAILED", message);
  }

  return data as BackendPaymentReceipt;
}

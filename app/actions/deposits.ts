"use server";

import { ApiError } from "@/lib/api/client";
import { depositRepository } from "@/lib/repositories";
import type {
  CreateDepositDecisionInput,
  BackendDepositDecisionResponse,
} from "@/lib/api/types";
import { depositErrorMessages, depositMessages } from "@/lib/messages/deposit";
import type { RetainDepositFormData } from "@/types";

export type DepositDecisionActionResult =
  | { ok: true; data: BackendDepositDecisionResponse; message: string }
  | { ok: false; message: string; code?: string; sessionExpired?: boolean };

export async function decideDepositAction(
  bookingId: string,
  input: CreateDepositDecisionInput
): Promise<DepositDecisionActionResult> {
  if (!bookingId) {
    return {
      ok: false,
      message: "El identificador de reserva es obligatorio.",
    };
  }

  try {
    const result = await depositRepository.decideDeposit(bookingId, input);
    const successMsg =
      input.decisionType === "DEVOLVER"
        ? depositMessages.refundSuccessNotice
        : depositMessages.retentionSuccessNotice;

    return {
      ok: true,
      data: result,
      message: successMsg,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        return {
          ok: false,
          code: "UNAUTHORIZED",
          message: depositErrorMessages.UNAUTHORIZED,
          sessionExpired: true,
        };
      }

      if (error.status === 403) {
        return {
          ok: false,
          code: "FORBIDDEN",
          message: depositErrorMessages.FORBIDDEN,
        };
      }

      const mappedMessage =
        (error.code && depositErrorMessages[error.code]) || error.message;

      return {
        ok: false,
        code: error.code,
        message: mappedMessage,
      };
    }

    console.error("Error al registrar decisión sobre el depósito:", error);
    return {
      ok: false,
      message: depositMessages.errorNotice,
    };
  }
}

export async function refundDepositAction(
  bookingId: string
): Promise<DepositDecisionActionResult> {
  return decideDepositAction(bookingId, { decisionType: "DEVOLVER" });
}

export async function retainDepositAction(
  bookingId: string,
  data: RetainDepositFormData
): Promise<DepositDecisionActionResult> {
  const amountStr =
    typeof data.amount === "number"
      ? data.amount.toFixed(2)
      : String(data.amount);

  return decideDepositAction(bookingId, {
    decisionType: "RETENER",
    retentionAmount: amountStr,
    retentionReason: data.reason,
  });
}

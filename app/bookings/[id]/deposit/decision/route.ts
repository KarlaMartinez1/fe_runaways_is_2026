import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { apiRequest, ApiError, apiPost } from "@/lib/api/client";
import { SESSION_COOKIE, parseSession } from "@/lib/session";
import { depositRepository } from "@/lib/repositories";
import type {
  CreateDepositDecisionInput,
  BackendDepositDecisionResponse,
} from "@/lib/api/types";
import { depositErrorMessages } from "@/lib/messages/deposit";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "El identificador de reserva (id) es obligatorio.",
        },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("authorization");
    const cookieStore = await cookies();
    const sessionCookieValue = cookieStore.get(SESSION_COOKIE)?.value;
    const sessionData = parseSession(sessionCookieValue);
    const hasValidSession = Boolean(sessionData?.accessToken);

    if (!hasValidSession && !authHeader) {
      return NextResponse.json(
        {
          code: "UNAUTHORIZED",
          message: depositErrorMessages.UNAUTHORIZED,
        },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as Partial<CreateDepositDecisionInput>;
    const decisionType = body.decisionType;

    if (!decisionType || (decisionType !== "DEVOLVER" && decisionType !== "RETENER")) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "decisionType debe ser DEVOLVER o RETENER.",
        },
        { status: 400 }
      );
    }

    if (decisionType === "RETENER") {
      const amount = body.retentionAmount;
      const reason = body.retentionReason;

      if (!amount || typeof amount !== "string" || !/^\d+(\.\d{1,2})?$/.test(amount)) {
        return NextResponse.json(
          {
            code: "VALIDATION_ERROR",
            message: "retentionAmount debe ser un monto decimal con hasta dos decimales.",
          },
          { status: 400 }
        );
      }

      if (parseFloat(amount) <= 0) {
        return NextResponse.json(
          {
            code: "VALIDATION_ERROR",
            message: "El monto a retener debe ser mayor que cero.",
          },
          { status: 400 }
        );
      }

      if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
        return NextResponse.json(
          {
            code: "VALIDATION_ERROR",
            message: "retentionReason no puede estar vacío.",
          },
          { status: 400 }
        );
      }

      if (reason.length > 250) {
        return NextResponse.json(
          {
            code: "VALIDATION_ERROR",
            message: "retentionReason no puede superar 250 caracteres.",
          },
          { status: 400 }
        );
      }
    }

    const payload: CreateDepositDecisionInput = {
      decisionType,
      retentionAmount: body.retentionAmount,
      retentionReason: body.retentionReason?.trim(),
    };

    if (process.env.USE_MOCKS !== "true") {
      const explicitToken = authHeader ? authHeader.replace(/^Bearer\s+/i, "") : undefined;

      const response =
        explicitToken && !hasValidSession
          ? await apiRequest<BackendDepositDecisionResponse>(
              `api/v1/bookings/${encodeURIComponent(bookingId)}/deposit/decision`,
              {
                method: "POST",
                body: payload,
                accessToken: explicitToken,
              }
            )
          : await apiPost<BackendDepositDecisionResponse>(
              `api/v1/bookings/${encodeURIComponent(bookingId)}/deposit/decision`,
              payload
            );

      return NextResponse.json(response, { status: 200 });
    }

    // Modo Mock
    const result = await depositRepository.decideDeposit(bookingId, payload);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ApiError) {
      const mappedMessage =
        (error.code && depositErrorMessages[error.code]) || error.message;

      return NextResponse.json(
        { code: error.code ?? "API_ERROR", message: mappedMessage },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "Ocurrió un error al procesar la decisión sobre el depósito.",
      },
      { status: 500 }
    );
  }
}

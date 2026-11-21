import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { apiRequest, ApiError, apiPost, apiGet } from "@/lib/api/client";
import { SESSION_COOKIE } from "@/lib/session";
import { paymentRepository } from "@/lib/repositories";
import type {
  BackendPaymentReceipt,
  BackendPaymentSummary,
  CreatePaymentInput,
} from "@/lib/api/types";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieStore = await cookies();
    const hasSessionCookie = Boolean(cookieStore.get(SESSION_COOKIE)?.value);
    const body = (await request.json().catch(() => ({}))) as Partial<CreatePaymentInput>;

    const bookingId = body.bookingId;
    const last4Digits = body.last4Digits;

    if (!bookingId || !last4Digits || !/^\d{4}$/.test(last4Digits)) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "El bookingId y los últimos 4 dígitos de la tarjeta (last4Digits) son obligatorios.",
        },
        { status: 400 }
      );
    }

    // Validación de sesión o encabezado de autorización
    if (!hasSessionCookie && !authHeader) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Se requiere iniciar sesión para pagar." },
        { status: 401 }
      );
    }

    if (process.env.USE_MOCKS !== "true") {
      const accessToken = authHeader ? authHeader.replace(/^Bearer\s+/i, "") : undefined;

      const receipt = accessToken && !hasSessionCookie
        ? await apiRequest<BackendPaymentReceipt>("api/v1/payments", {
            method: "POST",
            body: { bookingId, last4Digits },
            accessToken,
          })
        : await apiPost<BackendPaymentReceipt>("api/v1/payments", {
            bookingId,
            last4Digits,
          });

      return NextResponse.json(receipt, { status: 201 });
    }

    // Modo mock
    const result = await paymentRepository.pay({ bookingId, last4Digits });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { code: error.code ?? "API_ERROR", message: error.message },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "Error al procesar el pago" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId") || searchParams.get("reservationId");

    if (!bookingId) {
      return NextResponse.json(
        { code: "MISSING_BOOKING_ID", message: "El identificador de la reserva (bookingId) es obligatorio." },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("authorization");
    const cookieStore = await cookies();
    const hasSessionCookie = Boolean(cookieStore.get(SESSION_COOKIE)?.value);

    if (!hasSessionCookie && !authHeader) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Se requiere iniciar sesión para consultar el resumen de pago." },
        { status: 401 }
      );
    }

    if (process.env.USE_MOCKS !== "true") {
      const accessToken = authHeader ? authHeader.replace(/^Bearer\s+/i, "") : undefined;

      const summary = accessToken && !hasSessionCookie
        ? await apiRequest<BackendPaymentSummary>(
            `api/v1/payments/${encodeURIComponent(bookingId)}/summary`,
            { accessToken }
          )
        : await apiGet<BackendPaymentSummary>(
            `api/v1/payments/${encodeURIComponent(bookingId)}/summary`
          );

      return NextResponse.json(summary);
    }

    // Modo mock
    const summary = await paymentRepository.getSummary(bookingId);
    if (!summary) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Reserva no encontrada." },
        { status: 404 }
      );
    }
    return NextResponse.json(summary);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { code: error.code ?? "API_ERROR", message: error.message },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "Error al consultar resumen de pago" },
      { status: 500 }
    );
  }
}

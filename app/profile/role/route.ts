import { NextResponse, type NextRequest } from "next/server";
import { profileRepository } from "@/lib/repositories";
import { ApiError } from "@/lib/api/client";
import type { UserRole } from "@/types/models";

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      role?: UserRole;
    };

    if (!body.role || !["TENANT", "OWNER"].includes(body.role)) {
      return NextResponse.json(
        { code: "INVALID_ROLE", message: "El rol solicitado no es válido." },
        { status: 400 }
      );
    }

    const result = await profileRepository.changeRole(body.role);
    if (!result.success) {
      return NextResponse.json(
        {
          code: result.code ?? "ROLE_CHANGE_FAILED",
          message: result.message,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { code: error.code ?? "API_ERROR", message: error.message },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "Error al cambiar el rol de usuario" },
      { status: 500 }
    );
  }
}

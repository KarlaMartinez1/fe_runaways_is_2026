import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { profileRepository } from "@/lib/repositories";
import { apiRequest, ApiError } from "@/lib/api/client";
import { SESSION_COOKIE } from "@/lib/session";
import type {
  BackendProfileResponse,
  BackendRoleChangeResponse,
} from "@/lib/api/types";
import type { UserRole } from "@/types/models";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieStore = await cookies();
    const hasSessionCookie = Boolean(cookieStore.get(SESSION_COOKIE)?.value);

    if (authHeader && !hasSessionCookie && process.env.USE_MOCKS !== "true") {
      const accessToken = authHeader.replace(/^Bearer\s+/i, "");
      const profile = await apiRequest<BackendProfileResponse>(
        "api/v1/profile",
        {
          accessToken,
        }
      );
      return NextResponse.json(profile);
    }

    const profile = await profileRepository.getUserProfile();
    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { code: error.code ?? "API_ERROR", message: error.message },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "Error al consultar perfil de usuario" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieStore = await cookies();
    const hasSessionCookie = Boolean(cookieStore.get(SESSION_COOKIE)?.value);
    const body = (await request.json().catch(() => ({}))) as {
      role?: UserRole;
    };

    if (!body.role || !["TENANT", "OWNER"].includes(body.role)) {
      return NextResponse.json(
        { code: "INVALID_ROLE", message: "El rol solicitado no es válido." },
        { status: 400 }
      );
    }

    if (authHeader && !hasSessionCookie && process.env.USE_MOCKS !== "true") {
      const accessToken = authHeader.replace(/^Bearer\s+/i, "");
      const result = await apiRequest<BackendRoleChangeResponse>(
        "api/v1/profile/role",
        {
          method: "PATCH",
          body: { role: body.role },
          accessToken,
        }
      );
      return NextResponse.json(result);
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

import { apiGet, apiPatch, ApiError } from "@/lib/api/client";
import type {
  AccountStatus,
  BackendRoleChangeResponse,
  BackendUserResponse,
} from "@/lib/api/types";
import type {
  UserProfile,
  RoleRequirements,
  RoleChangeResult,
  UserRole,
} from "@/types/models";
import type { ProfileRepository } from "../profile-repository";

function formatMemberSince(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString("es-ES", { month: "long" });
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return `${capitalizedMonth} ${date.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

export const httpProfileRepository: ProfileRepository = {
  async getAccountStatus(): Promise<AccountStatus> {
    // TODO: falta este dato en el backend (el endpoint GET /api/v1/profile/document no existe aún en el backend)
    try {
      const user = await apiGet<BackendUserResponse>("api/v1/auth/me");
      // TODO: falta este dato en el backend (la propiedad isVerified no está expuesta en auth/me)
      return user.role === "OWNER" ? "VERIFICADA" : "SIN_VERIFICAR";
    } catch {
      return "SIN_VERIFICAR";
    }
  },

  async getUserProfile(): Promise<UserProfile> {
    // El backend no tiene GET /api/v1/profile, consumimos GET /api/v1/auth/me
    const user = await apiGet<BackendUserResponse>("api/v1/auth/me");

    const emailName = user.email.split("@")[0] ?? "Usuario";
    const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);

    return {
      id: user.id,
      // TODO: falta este dato en el backend (el nombre completo del usuario no se retorna en auth/me ni hay endpoint GET /api/v1/profile)
      fullName: formattedName,
      email: user.email,
      role: user.role,
      // TODO: falta este dato en el backend (el estado de verificación no está en auth/me ni hay endpoint de perfil)
      accountStatus: user.role === "OWNER" ? "VERIFICADA" : "SIN_VERIFICAR",
      // TODO: falta este dato en el backend (el backend no cuenta con endpoint para calificación promedio del usuario)
      rating: 0,
      // TODO: falta este dato en el backend (el backend no cuenta con endpoint para el conteo de reseñas recibidas)
      ratingCount: 0,
      // TODO: falta este dato en el backend (el tipo de documento de identidad no está expuesto)
      documentType: "DUI",
      // TODO: falta este dato en el backend (el número de documento de identidad no está expuesto)
      documentNumber: "---",
      memberSince: formatMemberSince(user.createdAt),
      avatarInitials: formattedName.slice(0, 2).toUpperCase(),
    };
  },

  async getRoleRequirements(): Promise<RoleRequirements> {
    // TODO: falta este dato en el backend (el backend no expone GET /api/v1/profile/role-requirements;
    // la validación de bloqueos por reservas activas y depósitos pendientes se realiza atómicamente
    // en el backend al invocar PATCH /api/v1/profile/role respondiendo con ROLE_CHANGE_BLOCKED o ACCOUNT_NOT_VERIFIED)
    let currentRole: UserRole = "TENANT";
    try {
      const user = await apiGet<BackendUserResponse>("api/v1/auth/me");
      currentRole = user.role;
    } catch {
      // Si falla la consulta de sesión, se asume TENANT por defecto
    }

    return {
      canSwitch: true,
      requirements: [
        {
          id: "verifiedAccount",
          label: "Cuenta verificada",
          // TODO: falta este dato en el backend (verificación de cuenta se valida en el backend retornando 403 ACCOUNT_NOT_VERIFIED)
          met: currentRole === "OWNER",
        },
        {
          id: "noPendingPayments",
          label: "Sin pagos pendientes",
          // TODO: falta este dato en el backend (se valida en PATCH /api/v1/profile/role retornando 409 ROLE_CHANGE_BLOCKED)
          met: true,
        },
        {
          id: "noPendingDeposits",
          label: "Sin depósitos pendientes de decisión",
          // TODO: falta este dato en el backend (se valida en PATCH /api/v1/profile/role retornando 409 ROLE_CHANGE_BLOCKED)
          met: true,
        },
      ],
    };
  },

  async changeRole(newRole: UserRole): Promise<RoleChangeResult> {
    try {
      const res = await apiPatch<BackendRoleChangeResponse, { role: UserRole }>(
        "api/v1/profile/role",
        { role: newRole }
      );

      return {
        success: true,
        newRole: res.role,
        accessToken: res.accessToken,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          throw error;
        }
        return {
          success: false,
          code: error.code,
          message: error.message,
        };
      }
      throw error;
    }
  },
};

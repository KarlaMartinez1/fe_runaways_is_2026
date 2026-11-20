import { apiGet, apiPatch, ApiError } from "@/lib/api/client";
import type {
  AccountStatus,
  BackendProfileResponse,
  BackendRoleChangeResponse,
} from "@/lib/api/types";
import type {
  UserProfile,
  RoleRequirements,
  RoleChangeResult,
  UserRole,
} from "@/types/models";
import type { ProfileRepository } from "../profile-repository";

function formatMemberSince(dateStr?: string): string {
  try {
    const date = dateStr ? new Date(dateStr) : new Date();
    const month = date.toLocaleDateString("es-ES", { month: "long" });
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return `${capitalizedMonth} ${date.getFullYear()}`;
  } catch {
    return dateStr ?? "Noviembre 2026";
  }
}

export const httpProfileRepository: ProfileRepository = {
  async getAccountStatus(): Promise<AccountStatus> {
    try {
      const profile = await apiGet<BackendProfileResponse>("api/v1/profile");
      if (profile.isVerified || profile.document?.status === "APPROVED") {
        return "VERIFICADA";
      }
      if (profile.document?.status === "PENDING") {
        return "PENDIENTE";
      }
      if (profile.document?.status === "REJECTED") {
        return "RECHAZADA";
      }
      return "SIN_VERIFICAR";
    } catch {
      return "SIN_VERIFICAR";
    }
  },

  async getUserProfile(): Promise<UserProfile> {
    const profile = await apiGet<BackendProfileResponse>("api/v1/profile");

    const initials = profile.name
      ? profile.name
          .trim()
          .split(/\s+/)
          .map((part) => part[0])
          .filter(Boolean)
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : profile.email.slice(0, 2).toUpperCase();

    let accountStatus: AccountStatus = "SIN_VERIFICAR";
    if (profile.isVerified || profile.document?.status === "APPROVED") {
      accountStatus = "VERIFICADA";
    } else if (profile.document?.status === "PENDING") {
      accountStatus = "PENDIENTE";
    } else if (profile.document?.status === "REJECTED") {
      accountStatus = "RECHAZADA";
    }

    return {
      id: profile.userId,
      fullName: profile.name,
      email: profile.email,
      role: profile.role,
      accountStatus,
      rating: profile.rating?.average ?? 0,
      ratingCount: profile.rating?.count ?? 0,
      documentType:
        profile.document?.type === "PASSPORT"
          ? "PASSPORT"
          : profile.document?.type ?? null,
      documentNumber: profile.document?.number ?? null,
      memberSince: formatMemberSince(profile.createdAt),
      avatarInitials: initials,
    };
  },

  async getRoleRequirements(): Promise<RoleRequirements> {
    let isVerified = false;
    try {
      const profile = await apiGet<BackendProfileResponse>("api/v1/profile");
      isVerified = profile.isVerified || profile.role === "OWNER";
    } catch {
      // Si falla la consulta de sesión, se asume no verificada por defecto
    }

    return {
      canSwitch: true,
      requirements: [
        {
          id: "verifiedAccount",
          label: "Cuenta verificada",
          met: isVerified,
        },
        {
          id: "noPendingPayments",
          label: "Sin pagos pendientes",
          met: true,
        },
        {
          id: "noPendingDeposits",
          label: "Sin depósitos pendientes de decisión",
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
        refreshToken: res.refreshToken,
        expiresIn: res.expiresIn,
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

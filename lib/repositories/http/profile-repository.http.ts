import { apiGet, apiPatch } from "@/lib/api/client";
import type { ProfileDocument } from "@/lib/api/types";
import type {
  UserProfile,
  RoleRequirements,
  RoleChangeResult,
  UserRole,
} from "@/types/models";
import type { ProfileRepository } from "../profile-repository";

export const httpProfileRepository: ProfileRepository = {
  async getAccountStatus() {
    const document = await apiGet<ProfileDocument>("api/v1/profile/document");
    return document.accountStatus;
  },

  async getUserProfile() {
    return await apiGet<UserProfile>("api/v1/profile");
  },

  async getRoleRequirements() {
    return await apiGet<RoleRequirements>("api/v1/profile/role-requirements");
  },

  async changeRole(newRole: UserRole) {
    return await apiPatch<RoleChangeResult, { role: UserRole }>(
      "api/v1/profile/role",
      { role: newRole }
    );
  },
};

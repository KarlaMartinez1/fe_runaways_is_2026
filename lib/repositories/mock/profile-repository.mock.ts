import type { AccountStatus } from "@/lib/api/types";
import type {
  UserProfile,
  UserRole,
} from "@/types/models";
import type { ProfileRepository } from "../profile-repository";
import {
  mockUserProfileFixture,
  mockRoleRequirementsFixture,
} from "./fixtures/profile";

const validStatuses: AccountStatus[] = [
  "SIN_VERIFICAR",
  "PENDIENTE",
  "VERIFICADA",
  "RECHAZADA",
];

let inMemoryProfile: UserProfile = { ...mockUserProfileFixture };

export const mockProfileRepository: ProfileRepository = {
  async getAccountStatus() {
    const value = process.env.MOCK_ACCOUNT_STATUS as AccountStatus | undefined;
    return value && validStatuses.includes(value)
      ? value
      : inMemoryProfile.accountStatus;
  },

  async getUserProfile(scenario?: string) {
    if (scenario === "unverified") {
      return {
        ...mockUserProfileFixture,
        accountStatus: "SIN_VERIFICAR",
        ratingCount: 0,
        rating: 0,
      };
    }

    if (scenario === "pending-deposit") {
      return {
        ...mockUserProfileFixture,
        role: "OWNER",
      };
    }

    return { ...inMemoryProfile };
  },

  async getRoleRequirements(scenario?: string) {
    if (scenario === "pending-payment") {
      return {
        ...mockRoleRequirementsFixture,
        canSwitch: false,
        hasPendingPayments: true,
        requirements: mockRoleRequirementsFixture.requirements.map((req) =>
          req.id === "noPendingPayments" ? { ...req, met: false } : { ...req }
        ),
      };
    }

    if (scenario === "unverified") {
      return {
        ...mockRoleRequirementsFixture,
        canSwitch: false,
        requirements: mockRoleRequirementsFixture.requirements.map((req) =>
          req.id === "verifiedAccount" ? { ...req, met: false } : { ...req }
        ),
      };
    }

    if (scenario === "pending-deposit") {
      return {
        ...mockRoleRequirementsFixture,
        canSwitch: false,
        hasPendingDeposits: true,
        requirements: mockRoleRequirementsFixture.requirements.map((req) =>
          req.id === "noPendingDeposits" ? { ...req, met: false } : { ...req }
        ),
      };
    }

    return {
      ...mockRoleRequirementsFixture,
      requirements: mockRoleRequirementsFixture.requirements.map((r) => ({
        ...r,
      })),
    };
  },

  async changeRole(newRole: UserRole) {
    if (newRole === inMemoryProfile.role) {
      return {
        success: false,
        message: "El usuario ya tiene ese rol asignado.",
      };
    }

    inMemoryProfile = {
      ...inMemoryProfile,
      role: newRole,
    };

    return {
      success: true,
      newRole,
      token: "mock-jwt-token-after-role-change",
    };
  },
};

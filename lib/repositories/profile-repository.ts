import type { AccountStatus } from "@/lib/api/types";
import type {
  UserProfile,
  RoleRequirements,
  RoleChangeResult,
  UserRole,
} from "@/types/models";

export interface ProfileRepository {
  getAccountStatus(): Promise<AccountStatus>;
  getUserProfile(scenario?: string): Promise<UserProfile>;
  getRoleRequirements(scenario?: string): Promise<RoleRequirements>;
  changeRole(newRole: UserRole): Promise<RoleChangeResult>;
}

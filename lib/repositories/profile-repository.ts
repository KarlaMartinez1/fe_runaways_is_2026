import type { AccountStatus } from "@/lib/api/types";

export interface ProfileRepository {
  getAccountStatus(): Promise<AccountStatus>;
}
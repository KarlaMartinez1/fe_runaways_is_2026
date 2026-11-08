import type { AccountStatus } from "@/lib/api/types";
import type { ProfileRepository } from "../profile-repository";

const validStatuses: AccountStatus[] = ["SIN_VERIFICAR", "PENDIENTE", "VERIFICADA", "RECHAZADA"];

export const mockProfileRepository: ProfileRepository = {
  async getAccountStatus() {
    const value = process.env.MOCK_ACCOUNT_STATUS as AccountStatus | undefined;
    return value && validStatuses.includes(value) ? value : "SIN_VERIFICAR";
  },
};
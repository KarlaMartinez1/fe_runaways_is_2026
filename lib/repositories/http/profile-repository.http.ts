import { apiGet } from "@/lib/api/client";
import type { ProfileDocument } from "@/lib/api/types";
import type { ProfileRepository } from "../profile-repository";

export const httpProfileRepository: ProfileRepository = {
  async getAccountStatus() {
    const document = await apiGet<ProfileDocument>("api/v1/profile/document");
    return document.accountStatus;
  },
};
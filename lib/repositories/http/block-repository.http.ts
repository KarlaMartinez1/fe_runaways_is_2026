import { apiDelete, apiGet, apiPost } from "@/lib/api/client";
import type { NoAvailabilityBlock } from "@/lib/api/types";
import type { BlockRepository, CreateBlockInput } from "../block-repository";

function normalize(block: NoAvailabilityBlock): NoAvailabilityBlock {
  return {
    ...block,
    startDate: block.startDate.slice(0, 10),
    endDate: block.endDate.slice(0, 10),
  };
}

export const httpBlockRepository: BlockRepository = {
  async listByProperty(propertyId) {
    const blocks = await apiGet<NoAvailabilityBlock[]>(
      `api/v1/properties/${encodeURIComponent(propertyId)}/blocks`,
    );
    return blocks.map(normalize);
  },

  async create(propertyId, input: CreateBlockInput) {
    const block = await apiPost<NoAvailabilityBlock>(
      `api/v1/properties/${encodeURIComponent(propertyId)}/blocks`,
      input,
    );
    return normalize(block);
  },

  remove(blockId) {
    return apiDelete(`api/v1/blocks/${encodeURIComponent(blockId)}`);
  },
};
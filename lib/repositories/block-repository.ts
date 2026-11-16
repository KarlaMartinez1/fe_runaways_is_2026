import type { NoAvailabilityBlock } from "@/lib/api/types";

export type CreateBlockInput = {
  startDate: string;
  endDate: string;
};

export interface BlockRepository {
  listByProperty(propertyId: string): Promise<NoAvailabilityBlock[]>;
  create(propertyId: string, input: CreateBlockInput): Promise<NoAvailabilityBlock>;
  remove(blockId: string): Promise<void>;
}
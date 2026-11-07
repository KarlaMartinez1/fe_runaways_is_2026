import type { Paginated, Property } from "@/lib/api/types";

export const PROPERTIES_PAGE_SIZE = 12;

export interface PropertyRepository {
  listAvailable(page: number): Promise<Paginated<Property>>;
}
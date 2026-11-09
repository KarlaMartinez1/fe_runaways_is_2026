import type { Paginated, PropertyAvailability, Property, PropertyDetail } from "@/lib/api/types";

export const PROPERTIES_PAGE_SIZE = 12;

export interface PropertyRepository {
  listAvailable(page: number): Promise<Paginated<Property>>;
  getById(id: string): Promise<PropertyDetail | null>;
  getAvailability(id: string): Promise<PropertyAvailability | null>;
}
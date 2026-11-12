import type {
  NewPropertyInput,
  Paginated,
  Property,
  PropertyAvailability,
  PropertyDetail,
  PropertyFilters,
} from "@/lib/api/types";

export const PROPERTIES_PAGE_SIZE = 12;

export interface PropertyRepository {
  listAvailable(page: number, filters?: PropertyFilters): Promise<Paginated<Property>>;
  getById(id: string): Promise<PropertyDetail | null>;
  getAvailability(id: string): Promise<PropertyAvailability | null>;
  create(input: NewPropertyInput): Promise<Property>;
}
import type {
  NewPropertyInput,
  OwnerProperty,
  Paginated,
  Property,
  PropertyAvailability,
  PropertyDetail,
  PropertyFilters,
  UpdatePropertyInput,
} from "@/lib/api/types";

export const PROPERTIES_PAGE_SIZE = 12;

export interface PropertyRepository {
  listAvailable(page: number, filters?: PropertyFilters): Promise<Paginated<Property>>;
  getById(id: string): Promise<PropertyDetail | null>;
  getAvailability(id: string): Promise<PropertyAvailability | null>;
  create(input: NewPropertyInput): Promise<Property>;
  // H4: bienes del arrendador en sesión (DISPONIBLE y PAUSADO), 12 por página.
  listMine(page: number): Promise<Paginated<Property>>;
  // H4: un bien del arrendador para la pantalla de gestión. null si no existe o no es suyo.
  getMine(id: string): Promise<OwnerProperty | null>;
  // H4: guarda los cambios del bien.
  update(id: string, input: UpdatePropertyInput): Promise<Property>;
}
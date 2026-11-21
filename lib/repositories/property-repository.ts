import type {
  NewPropertyInput,
  OwnerProperty,
  Paginated,
  Property,
  PropertyAvailability,
  PropertyDetail,
  PropertyFilters,
  PropertyStatusChange,
  UpdatePropertyInput,
} from "@/lib/api/types";

export const PROPERTIES_PAGE_SIZE = 12;

// H5: estados que el arrendador puede elegir al pausar o reactivar.
export type ManageableStatus = "DISPONIBLE" | "PAUSADO";

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
  // H5: pausa (PAUSADO) o reactiva (DISPONIBLE) un bien del arrendador.
  changeStatus(id: string, status: ManageableStatus): Promise<PropertyStatusChange>;
  // H5: elimina el bien (pasa a ELIMINADO).
  remove(id: string): Promise<void>;
}
import { ApiError, apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api/client";
import type {
  NewPropertyInput,
  OwnerProperty,
  Paginated,
  Property,
  PropertyAvailability,
  PropertyDetail,
  PropertyStatusChange,
  UpdatePropertyInput,
} from "@/lib/api/types";
import { filtersToQuery } from "@/lib/filters/property-filters";
import type { ManageableStatus, PropertyRepository } from "../property-repository";

export const httpPropertyRepository: PropertyRepository = {
  listAvailable(page, filters = {}) {
    const params = new URLSearchParams({ ...filtersToQuery(filters), page: String(page) });
    return apiGet<Paginated<Property>>(`api/v1/properties?${params.toString()}`);
  },

  async getById(id) {
    try {
      return await apiGet<PropertyDetail>(`api/v1/properties/${encodeURIComponent(id)}`);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
        return null;
      }
      throw error;
    }
  },

  async getAvailability(id) {
    try {
      const data = await apiGet<PropertyAvailability>(
        `api/v1/properties/${encodeURIComponent(id)}/availability`,
      );
      return {
        ...data,
        from: data.from.slice(0, 10),
        to: data.to.slice(0, 10),
        occupiedDates: data.occupiedDates.map((date) => date.slice(0, 10)),
      };
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
        return null;
      }
      throw error;
    }
  },

  create(input) {
    return apiPost<Property, NewPropertyInput>("api/v1/properties", input);
  },

  // H4: rutas de lectura del arrendador por confirmar con el backend.
  listMine(page) {
    const params = new URLSearchParams({ page: String(page) });
    return apiGet<Paginated<Property>>(`api/v1/properties/mine?${params.toString()}`);
  },

  async getMine(id) {
    try {
      return await apiGet<OwnerProperty>(`api/v1/properties/mine/${encodeURIComponent(id)}`);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
        return null;
      }
      throw error;
    }
  },

  update(id, input) {
    return apiPut<Property, UpdatePropertyInput>(
      `api/v1/properties/${encodeURIComponent(id)}`,
      input,
    );
  },

  changeStatus(id, status) {
    return apiPatch<PropertyStatusChange, { status: ManageableStatus }>(
      `api/v1/properties/${encodeURIComponent(id)}/status`,
      { status },
    );
  },

  remove(id) {
    return apiDelete(`api/v1/properties/${encodeURIComponent(id)}`);
  },
};
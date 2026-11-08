import { ApiError, apiGet } from "@/lib/api/client";
import type { Paginated, Property, PropertyDetail } from "@/lib/api/types";
import { filtersToQuery } from "@/lib/filters/property-filters";
import type { PropertyRepository } from "../property-repository";

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
};
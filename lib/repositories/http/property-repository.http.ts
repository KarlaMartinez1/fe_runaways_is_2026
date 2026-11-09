import { ApiError, apiGet } from "@/lib/api/client";
import type { Paginated, Property, PropertyAvailability, PropertyDetail } from "@/lib/api/types";
import type { PropertyRepository } from "../property-repository";

export const httpPropertyRepository: PropertyRepository = {
  listAvailable(page) {
    return apiGet<Paginated<Property>>(`api/v1/properties?page=${page}`);
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
};
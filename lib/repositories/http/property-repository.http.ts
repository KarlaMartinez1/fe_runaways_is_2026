import { apiGet } from "@/lib/api/client";
import type { Paginated, Property } from "@/lib/api/types";
import type { PropertyRepository } from "../property-repository";

export const httpPropertyRepository: PropertyRepository = {
  listAvailable(page) {
    return apiGet<Paginated<Property>>(`api/v1/properties?page=${page}`);
  },
};
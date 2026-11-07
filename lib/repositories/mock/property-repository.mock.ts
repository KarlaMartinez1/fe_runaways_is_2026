import { PROPERTIES_PAGE_SIZE, type PropertyRepository } from "../property-repository";
import { propertyFixtures } from "./fixtures/properties";

export const mockPropertyRepository: PropertyRepository = {
  async listAvailable(page) {
    const available = propertyFixtures
      .filter((property) => property.status === "DISPONIBLE")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const total = available.length;
    const totalPages = Math.max(1, Math.ceil(total / PROPERTIES_PAGE_SIZE));
    const start = (page - 1) * PROPERTIES_PAGE_SIZE;

    return {
      data: available.slice(start, start + PROPERTIES_PAGE_SIZE),
      page,
      totalPages,
      total,
    };
  },
};
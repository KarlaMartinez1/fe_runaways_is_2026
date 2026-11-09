import { PROPERTIES_PAGE_SIZE, type PropertyRepository } from "../property-repository";
import { propertyFixtures } from "./fixtures/properties";
import { defaultDetailExtras, propertyDetailExtras } from "./fixtures/property-details";
import { buildMockAvailability } from "./fixtures/availability";

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

  async getById(id) {
    const property = propertyFixtures.find((item) => item.id === id);
    if (!property || property.status !== "DISPONIBLE") {
      return null;
    }

    const extras = propertyDetailExtras[id] ?? {
      ...defaultDetailExtras,
      reviewCount: property.averageRating == null ? 0 : defaultDetailExtras.reviewCount,
    };

    return { ...property, ...extras };
  },
  async getAvailability(id) {
    const property = propertyFixtures.find((item) => item.id === id);
    if (!property || property.status !== "DISPONIBLE") {
      return null;
    }

    return { propertyId: id, ...buildMockAvailability(id) };
  },
};
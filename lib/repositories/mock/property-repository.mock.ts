import type { Property, PropertyDetail, PropertyFilters } from "@/lib/api/types";
import { normalizeText } from "@/lib/filters/property-filters";
import { PROPERTIES_PAGE_SIZE, type PropertyRepository } from "../property-repository";
import { propertyFixtures } from "./fixtures/properties";
import { defaultDetailExtras, propertyDetailExtras } from "./fixtures/property-details";
import { getMockOccupiedDates } from "./booking-repository.mock";
import { buildMockAvailability } from "./fixtures/availability";
import { rangeOverlapsOccupied } from "@/lib/bookings/rules";

function toDetail(property: Property): PropertyDetail {
  const extras = propertyDetailExtras[property.id] ?? {
    ...defaultDetailExtras,
    reviewCount: property.averageRating == null ? 0 : defaultDetailExtras.reviewCount,
  };
  return { ...property, ...extras };
}

function matchesFilters(property: PropertyDetail, filters: PropertyFilters) {
  if (filters.q) {
    const term = normalizeText(filters.q);
    const searchable = normalizeText(
      [property.title, property.description, property.department, property.municipality].join(" "),
    );
    if (!searchable.includes(term)) return false;
  }
  if (filters.department && property.department !== filters.department) return false;
  if (filters.municipality && property.municipality !== filters.municipality) return false;
  if (filters.category && property.category !== filters.category) return false;
  if (filters.noDeposit && Number(property.securityDeposit) > 0) return false;

  const price = Number(property.pricePerDay);
  if (filters.minPrice !== undefined && price < filters.minPrice) return false;
  if (filters.maxPrice !== undefined && price > filters.maxPrice) return false;
  if (filters.startDate && filters.endDate) {
    const occupied = getMockOccupiedDates(property.id);
    if (rangeOverlapsOccupied(filters.startDate, filters.endDate, occupied)) return false;
  }
  return true;
}

export const mockPropertyRepository: PropertyRepository = {
  async listAvailable(page, filters = {}) {
    const available = propertyFixtures
      .filter((property) => property.status === "DISPONIBLE")
      .map(toDetail)
      .filter((property) => matchesFilters(property, filters))
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
    return toDetail(property);
  },
    async getAvailability(id) {
    const property = propertyFixtures.find((item) => item.id === id);
    if (!property || property.status !== "DISPONIBLE") {
      return null;
    }

    const { from, to } = buildMockAvailability(id);
    return { propertyId: id, from, to, occupiedDates: getMockOccupiedDates(id) };
  },
};
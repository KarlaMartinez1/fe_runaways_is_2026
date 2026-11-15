import { ApiError } from "@/lib/api/client";
import type { OwnerProperty, Property, PropertyDetail, PropertyFilters } from "@/lib/api/types";
import { rangeOverlapsOccupied } from "@/lib/bookings/rules";
import { normalizeText } from "@/lib/filters/property-filters";
import { propertyFormMessages } from "@/lib/messages/property-form";
import { PROPERTIES_PAGE_SIZE, type PropertyRepository } from "../property-repository";
import { propertyFixtures } from "./fixtures/properties";
import { defaultDetailExtras, propertyDetailExtras } from "./fixtures/property-details";
import { getMockBookedDates, getMockOccupiedDates } from "./booking-repository.mock";
import { buildMockAvailability } from "./fixtures/availability";
import { mockUserProfileFixture } from "./fixtures/profile";

function toDetail(property: Property): PropertyDetail {
  const extras = propertyDetailExtras[property.id] ?? {
    ...defaultDetailExtras,
    reviewCount: property.averageRating == null ? 0 : defaultDetailExtras.reviewCount,
  };
  return { ...property, ...extras };
}

// H4: bienes que pertenecen al usuario de prueba. Los que se publican con H1 se agregan aquí.
const mockOwnedIds = new Set(["p-01", "p-03", "p-05", "p-07", "p-09", "p-11", "p-13", "p-15"]);

// H4: dirección exacta de cada bien (solo la ve el dueño).
const mockAddresses: Record<string, string> = {};
const DEFAULT_MOCK_ADDRESS = "Dirección de prueba del bien";

function isOwnedAndActive(property: Property) {
  return mockOwnedIds.has(property.id) && property.status !== "ELIMINADO";
}

function toOwnerProperty(property: Property): OwnerProperty {
  return { ...toDetail(property), address: mockAddresses[property.id] ?? DEFAULT_MOCK_ADDRESS };
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

  // H8: se excluye el bien si algún día del rango está ocupado (reservas vigentes o bloqueos)
  // con los mismos datos que usa el calendario de disponibilidad (H9).
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

  // H1: el bien se guarda en memoria y aparece en el catálogo hasta reiniciar el servidor.
  async create(input) {
    const property: Property = {
      id: `p-${Date.now()}`,
      title: input.title,
      category: input.category,
      department: input.department,
      municipality: input.municipality,
      pricePerDay: input.pricePerDay,
      images: input.images,
      status: "DISPONIBLE",
      createdAt: new Date().toISOString(),
      averageRating: null,
    };

    propertyFixtures.push(property);
    mockOwnedIds.add(property.id);
    mockAddresses[property.id] = input.address;
    propertyDetailExtras[property.id] = {
      description: input.description,
      securityDeposit: input.securityDeposit,
      ownerName: mockUserProfileFixture.fullName,
      reviewCount: 0,
    };

    return property;
  },

  async listMine(page) {
    const mine = propertyFixtures
      .filter(isOwnedAndActive)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const total = mine.length;
    const totalPages = Math.max(1, Math.ceil(total / PROPERTIES_PAGE_SIZE));
    const start = (page - 1) * PROPERTIES_PAGE_SIZE;

    return {
      data: mine.slice(start, start + PROPERTIES_PAGE_SIZE),
      page,
      totalPages,
      total,
    };
  },

  async getMine(id) {
    const property = propertyFixtures.find((item) => item.id === id);
    if (!property || !isOwnedAndActive(property)) {
      return null;
    }
    return toOwnerProperty(property);
  },

  // H4: simula PUT /api/v1/properties/:id con las mismas reglas del backend.
  async update(id, input) {
    const property = propertyFixtures.find((item) => item.id === id);
    if (!property || !isOwnedAndActive(property)) {
      throw new ApiError(404);
    }

    const current = toDetail(property);
    const moneyChanged =
      input.pricePerDay !== Number(current.pricePerDay).toFixed(2) ||
      input.securityDeposit !== Number(current.securityDeposit).toFixed(2);
    // Reservas PENDIENTE o PAGADA del bien (las mismas que ocupan el calendario).
    const hasActiveBookings = getMockBookedDates(id).length > 0;
    if (moneyChanged && hasActiveBookings) {
      throw new ApiError(409, undefined, propertyFormMessages.moneyLocked);
    }

    property.title = input.title;
    property.category = input.category;
    property.department = input.department;
    property.municipality = input.municipality;
    property.pricePerDay = input.pricePerDay;
    property.images = input.images;

    propertyDetailExtras[id] = {
      description: input.description,
      securityDeposit: input.securityDeposit,
      ownerName: current.ownerName,
      reviewCount: current.reviewCount,
    };
    mockAddresses[id] = input.address;

    return property;
  },
};
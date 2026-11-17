import { ApiError, apiDelete, apiGet, apiPatch, apiPut } from "@/lib/api/client";
import { apiFetch } from "@/lib/api/server-client";
import type {
  OwnerProperty,
  PropertyCategory,
  Paginated,
  Property,
  PropertyAvailability,
  PropertyDetail,
  PropertyStatusChange,
  UpdatePropertyInput,
} from "@/lib/api/types";
import { filtersToQuery } from "@/lib/filters/property-filters";
import type { ManageableStatus, PropertyRepository } from "../property-repository";

// El backend usa el enum PropertyCategory en inglés.
const apiCategory: Record<PropertyCategory, string> = {
  PROPIEDAD: "PROPERTY",
  EQUIPO: "EQUIPMENT",
};

const fromApiCategory: Record<string, PropertyCategory> = {
  PROPERTY: "PROPIEDAD",
  EQUIPMENT: "EQUIPO",
};

// H3: respuesta de GET /api/v1/properties/:id. Los promedios llegan como texto con un decimal.
type ApiPropertyDetail = {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  municipality: string;
  pricePerDay: string;
  securityDeposit: string;
  images: string[];
  owner: { id: string; name: string };
  propertyRatingAverage: string | null;
  propertyReviewCount: number;
  ownerRatingAverage: string | null;
  ownerReviewCount: number;
  reviews: {
    id: string;
    propertyRating: number;
    comment: string | null;
    createdAt: string;
    author: { name: string };
  }[];
};

function toRating(value: string | null) {
  return value === null ? null : Number(value);
}

function toPropertyDetail(data: ApiPropertyDetail): PropertyDetail {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    category: fromApiCategory[data.category],
    department: data.department,
    municipality: data.municipality,
    pricePerDay: data.pricePerDay,
    securityDeposit: data.securityDeposit,
    images: data.images,
    // El detalle público solo devuelve bienes AVAILABLE y no incluye createdAt.
    status: "DISPONIBLE",
    createdAt: "",
    ownerName: data.owner.name,
    averageRating: toRating(data.propertyRatingAverage),
    reviewCount: data.propertyReviewCount,
    ownerAverageRating: toRating(data.ownerRatingAverage),
    ownerReviewCount: data.ownerReviewCount,
    propertyReviews: data.reviews.map((review) => ({
      id: review.id,
      reviewerName: review.author.name,
      rating: review.propertyRating,
      comment: review.comment,
      createdAt: review.createdAt,
    })),
  };
}

export const httpPropertyRepository: PropertyRepository = {
  listAvailable(page, filters = {}) {
    const params = new URLSearchParams({ ...filtersToQuery(filters), page: String(page) });
    return apiGet<Paginated<Property>>(`api/v1/properties?${params.toString()}`);
  },

  async getById(id) {
    try {
      const data = await apiGet<ApiPropertyDetail>(`api/v1/properties/${encodeURIComponent(id)}`);
      return toPropertyDetail(data);
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

  // H1: el backend recibe multipart/form-data con las fotos en "images" y las sube a Cloudinary.
  // Se usa apiFetch (fetch con la sesión) porque los helpers de client.ts solo envían JSON.
  async create(input) {
    const formData = new FormData();
    formData.append("title", input.title);
    formData.append("description", input.description);
    formData.append("category", apiCategory[input.category]);
    formData.append("department", input.department);
    formData.append("municipality", input.municipality);
    formData.append("address", input.address);
    formData.append("pricePerDay", input.pricePerDay);
    formData.append("securityDeposit", input.securityDeposit);
    for (const image of input.images) formData.append("images", image);

    const response = await apiFetch("api/v1/properties", { method: "POST", body: formData });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
      throw new ApiError(response.status, body.code, typeof message === "string" ? message : undefined);
    }
    // shortcut: category/status llegan en inglés (PROPERTY, AVAILABLE); la acción de H1 no usa la respuesta.
    // Mapearlos al integrar H2/H4, que sí los muestran.
    return (await response.json()) as Property;
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
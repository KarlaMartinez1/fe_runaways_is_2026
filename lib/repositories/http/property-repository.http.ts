import { ApiError, apiDelete, apiGet, apiPatch } from "@/lib/api/client";
import { apiFetch } from "@/lib/api/server-client";
import type {
  OwnerProperty,
  PropertyCategory,
  Paginated,
  Property,
  PropertyAvailability,
  PropertyDetail,
  PropertyStatus,
  PropertyStatusChange,
  NewPropertyInput,
} from "@/lib/api/types";
import { filtersToQuery } from "@/lib/filters/property-filters";
import type { PropertyRepository } from "../property-repository";

// El backend usa el enum PropertyCategory en inglés.
const apiCategory: Record<PropertyCategory, string> = {
  PROPIEDAD: "PROPERTY",
  EQUIPO: "EQUIPMENT",
};

const fromApiCategory: Record<string, PropertyCategory> = {
  PROPERTY: "PROPIEDAD",
  EQUIPMENT: "EQUIPO",
};

const fromApiStatus: Record<string, PropertyStatus> = {
  AVAILABLE: "DISPONIBLE",
  PAUSED: "PAUSADO",
  DELETED: "ELIMINADO",
};

// Elemento de GET /api/v1/properties (H2) y GET /api/v1/properties/mine (H4).
// El catálogo no incluye status porque solo devuelve bienes AVAILABLE.
type ApiPropertyItem = Omit<Property, "category" | "status" | "createdAt"> & {
  category: string;
  status?: string;
};

// El backend pagina con pageSize (12) en lugar de totalPages.
type ApiPage<T> = { data: T[]; total: number; page: number; pageSize: number };

function toPropertyPage(result: ApiPage<ApiPropertyItem>): Paginated<Property> {
  return {
    data: result.data.map((item) => ({
      ...item,
      category: fromApiCategory[item.category],
      status: item.status ? fromApiStatus[item.status] : "DISPONIBLE",
      createdAt: "",
    })),
    total: result.total,
    page: result.page,
    totalPages: Math.max(1, Math.ceil(result.total / result.pageSize)),
  };
}

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

// H1/H4: respuesta de POST /properties, PUT /properties/:id y GET /properties/:id/owner.
type ApiOwnerProperty = {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  municipality: string;
  address: string;
  pricePerDay: string;
  securityDeposit: string;
  images: string[];
  status: string;
  createdAt: string;
};

function toOwnerProperty(data: ApiOwnerProperty): OwnerProperty {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    category: fromApiCategory[data.category],
    department: data.department,
    municipality: data.municipality,
    address: data.address,
    pricePerDay: data.pricePerDay,
    securityDeposit: data.securityDeposit,
    images: data.images,
    status: fromApiStatus[data.status],
    createdAt: data.createdAt,
    // La vista del dueño no trae arrendador ni reseñas; la pantalla de gestión no los usa.
    ownerName: "",
    reviewCount: 0,
  };
}

function toPropertyFormData(input: NewPropertyInput) {
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
  return formData;
}

// El backend recibe multipart/form-data con las fotos en "images" y las sube a Cloudinary.
// Se usa apiFetch (fetch con la sesión) porque los helpers de client.ts solo envían JSON.
async function sendPropertyForm(path: string, method: "POST" | "PUT", body: FormData) {
  const response = await apiFetch(path, { method, body });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    throw new ApiError(response.status, data.code, typeof message === "string" ? message : undefined);
  }
  return (await response.json()) as ApiOwnerProperty;
}

export const httpPropertyRepository: PropertyRepository = {
  async listAvailable(page, filters = {}) {
    const params = new URLSearchParams({ ...filtersToQuery(filters), page: String(page) });
    // La URL del frontend usa PROPIEDAD/EQUIPO; el backend espera PROPERTY/EQUIPMENT.
    if (filters.category) params.set("category", apiCategory[filters.category]);
    const result = await apiGet<ApiPage<ApiPropertyItem>>(`api/v1/properties?${params.toString()}`);
    return toPropertyPage(result);
  },

  async getById(id) {
    try {
      const data = await apiGet<ApiPropertyDetail>(`api/v1/properties/${encodeURIComponent(id)}`);
      // H3: traduce categoría, promedios y reseñas al modelo que consume la pantalla.
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
    return toOwnerProperty(
      await sendPropertyForm("api/v1/properties", "POST", toPropertyFormData(input)),
    );
  },

  async listMine(page) {
    const params = new URLSearchParams({ page: String(page) });
    const result = toPropertyPage(
      await apiGet<ApiPage<ApiPropertyItem>>(`api/v1/properties/mine?${params.toString()}`),
    );
    // shortcut: /properties/mine no devuelve securityDeposit; se pide a /properties/:id/owner por bien
    // (máx. 12 por página). Quitarlo cuando el backend incluya el depósito en la lista.
    const deposits = await Promise.all(
      result.data.map((property) =>
        apiGet<{ securityDeposit: string }>(
          `api/v1/properties/${encodeURIComponent(property.id)}/owner`,
        ),
      ),
    );
    return {
      ...result,
      data: result.data.map((property, index) => ({
        ...property,
        securityDeposit: deposits[index].securityDeposit,
      })),
    };
  },

  async getMine(id) {
    try {
      return toOwnerProperty(
        await apiGet<ApiOwnerProperty>(`api/v1/properties/${encodeURIComponent(id)}/owner`),
      );
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
        return null;
      }
      throw error;
    }
  },

  // H4: reemplazo integral en multipart/form-data, igual que H1, más las URLs a quitar.
  async update(id, input) {
    const formData = toPropertyFormData(input);
    formData.append("imagesToRemove", JSON.stringify(input.imagesToRemove));
    return toOwnerProperty(
      await sendPropertyForm(`api/v1/properties/${encodeURIComponent(id)}`, "PUT", formData),
    );
  },

  // H5: el backend recibe y devuelve el estado en inglés (AVAILABLE, PAUSED).
  async changeStatus(id, status) {
    const result = await apiPatch<PropertyStatusChange & { status: string }, { status: string }>(
      `api/v1/properties/${encodeURIComponent(id)}/status`,
      { status: status === "PAUSADO" ? "PAUSED" : "AVAILABLE" },
    );
    return { ...result, status: fromApiStatus[result.status] };
  },

  remove(id) {
    return apiDelete(`api/v1/properties/${encodeURIComponent(id)}`);
  },
};

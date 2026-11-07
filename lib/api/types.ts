export type PropertyCategory = "PROPIEDAD" | "EQUIPO";

export type PropertyStatus = "DISPONIBLE" | "PAUSADO" | "ELIMINADO";

export type Property = {
  id: string;
  title: string;
  category: PropertyCategory;
  department: string;
  municipality: string;
  pricePerDay: string;
  images: string[];
  status: PropertyStatus;
  createdAt: string;
  averageRating?: number | null;
};

export type Paginated<T> = {
  data: T[];
  page: number;
  totalPages: number;
  total: number;
};
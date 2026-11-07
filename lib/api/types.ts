export type PropertyCategory = "PROPIEDAD" | "EQUIPO";

export type Property = {
  id: string;
  title: string;
  category: PropertyCategory;
  department: string;
  municipality: string;
  pricePerDay: string;
  images: string[];
  averageRating?: number | null;
};
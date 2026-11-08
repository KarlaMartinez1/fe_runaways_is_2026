import type { PropertyCategory, PropertyFilters } from "@/lib/api/types";

type RawParams = Record<string, string | string[] | undefined>;

const categories: PropertyCategory[] = ["PROPIEDAD", "EQUIPO"];

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseFilters(params: RawParams): PropertyFilters {
  const q = single(params.q)?.trim();
  const department = single(params.department);
  const municipality = single(params.municipality);
  const category = single(params.category) as PropertyCategory | undefined;

  return {
    q: q && q.length >= 2 && q.length <= 100 ? q : undefined,
    department: department || undefined,
    municipality: department && municipality ? municipality : undefined,
    category: category && categories.includes(category) ? category : undefined,
    noDeposit: single(params.noDeposit) === "true" ? true : undefined,
  };
}

export function filtersToQuery(filters: PropertyFilters): Record<string, string> {
  const query: Record<string, string> = {};
  if (filters.q) query.q = filters.q;
  if (filters.department) query.department = filters.department;
  if (filters.municipality) query.municipality = filters.municipality;
  if (filters.category) query.category = filters.category;
  if (filters.noDeposit) query.noDeposit = "true";
  return query;
}

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
import type { PropertyCategory, PropertyFilters } from "@/lib/api/types";
import { countBookingDays } from "@/lib/bookings/rules";
import { searchMessages } from "@/lib/messages/properties";
import { addDaysIso, todayInElSalvador } from "@/lib/utils/dates";

type RawParams = Record<string, string | string[] | undefined>;

const categories: PropertyCategory[] = ["PROPIEDAD", "EQUIPO"];

export const PRICE_MIN = 0.01;
export const PRICE_MAX = 9999.99;
export const DATE_FILTER_WINDOW_DAYS = 90;
export const DATE_FILTER_MAX_DAYS = 30;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Reglas de H8. Devuelve el mensaje del primer error o undefined si el rango es válido.
export function getDateRangeError(startDate: string, endDate: string, today = todayInElSalvador()) {
  if (!startDate && !endDate) return undefined;
  if (!startDate || !endDate) return searchMessages.datesBoth;

  const lastDay = addDaysIso(today, DATE_FILTER_WINDOW_DAYS - 1);
  if (startDate < today) return searchMessages.dateStartBeforeToday;
  if (endDate < startDate) return searchMessages.dateEndBeforeStart;
  if (endDate > lastDay) return searchMessages.dateOutsideWindow;
  if (countBookingDays(startDate, endDate) > DATE_FILTER_MAX_DAYS) return searchMessages.dateTooLong;
  return undefined;
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

// Acepta solo números positivos entre 0.01 y 9999.99 con máximo 2 decimales.
export function parsePrice(value: string | undefined) {
  const text = value?.trim();
  if (!text || !/^\d+(\.\d{1,2})?$/.test(text)) return undefined;
  const price = Number(text);
  return price >= PRICE_MIN && price <= PRICE_MAX ? price : undefined;
}

export function parseFilters(params: RawParams): PropertyFilters {
  const q = single(params.q)?.trim();
  const department = single(params.department);
  const municipality = single(params.municipality);
  const category = single(params.category) as PropertyCategory | undefined;

  let minPrice = parsePrice(single(params.minPrice));
  let maxPrice = parsePrice(single(params.maxPrice));
  // Si el rango viene invertido en la URL, se ignora el filtro de precio completo.
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    minPrice = undefined;
    maxPrice = undefined;
  }

  // Las fechas solo se aceptan de a par, con formato AAAA-MM-DD y cumpliendo las reglas de H8.
  const startDate = single(params.startDate) ?? "";
  const endDate = single(params.endDate) ?? "";
  const validDates =
    ISO_DATE.test(startDate) && ISO_DATE.test(endDate) && !getDateRangeError(startDate, endDate);

  return {
    q: q && q.length >= 2 && q.length <= 100 ? q : undefined,
    department: department || undefined,
    municipality: department && municipality ? municipality : undefined,
    category: category && categories.includes(category) ? category : undefined,
    noDeposit: single(params.noDeposit) === "true" ? true : undefined,
    minPrice,
    maxPrice,
    startDate: validDates ? startDate : undefined,
    endDate: validDates ? endDate : undefined,
  };
}

export function filtersToQuery(filters: PropertyFilters): Record<string, string> {
  const query: Record<string, string> = {};
  if (filters.q) query.q = filters.q;
  if (filters.department) query.department = filters.department;
  if (filters.municipality) query.municipality = filters.municipality;
  if (filters.category) query.category = filters.category;
  if (filters.noDeposit) query.noDeposit = "true";
  if (filters.minPrice !== undefined) query.minPrice = filters.minPrice.toFixed(2);
  if (filters.maxPrice !== undefined) query.maxPrice = filters.maxPrice.toFixed(2);
  if (filters.startDate && filters.endDate) {
    query.startDate = filters.startDate;
    query.endDate = filters.endDate;
  }
  return query;
}

export function buildPropertiesHref(filters: PropertyFilters) {
  const query = new URLSearchParams(filtersToQuery(filters)).toString();
  return query ? `/properties?${query}` : "/properties";
}

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
import Link from "next/link";
import type { PropertyFilters } from "@/lib/api/types";
import { buildPropertiesHref } from "@/lib/filters/property-filters";
import { catalogMessages, filterMessages, searchMessages } from "@/lib/messages/properties";

type Chip = { key: string; label: string; next: PropertyFilters };

function getChips(filters: PropertyFilters): Chip[] {
  const chips: Chip[] = [];

  if (filters.q) {
    chips.push({ key: "q", label: `“${filters.q}”`, next: { ...filters, q: undefined } });
  }
  if (filters.department) {
    // Al quitar el departamento también se quita el municipio, que depende de él.
    chips.push({
      key: "department",
      label: filters.department,
      next: { ...filters, department: undefined, municipality: undefined },
    });
  }
  if (filters.municipality) {
    chips.push({
      key: "municipality",
      label: filters.municipality,
      next: { ...filters, municipality: undefined },
    });
  }
  if (filters.category) {
    chips.push({
      key: "category",
      label: filterMessages.categoryChips[filters.category],
      next: { ...filters, category: undefined },
    });
  }
  if (filters.noDeposit) {
    chips.push({
      key: "noDeposit",
      label: filterMessages.noDeposit,
      next: { ...filters, noDeposit: undefined },
    });
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    chips.push({
      key: "price",
      label: filterMessages.priceChip(filters.minPrice, filters.maxPrice),
      next: { ...filters, minPrice: undefined, maxPrice: undefined },
    });
  }
  if (filters.startDate && filters.endDate) {
    chips.push({
      key: "dates",
      label: filterMessages.dateChip(filters.startDate, filters.endDate),
      next: { ...filters, startDate: undefined, endDate: undefined },
    });
  }
  return chips;
}

type ActiveFiltersProps = {
  filters: PropertyFilters;
  total: number;
};

export function ActiveFilters({ filters, total }: ActiveFiltersProps) {
  const chips = getChips(filters);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {chips.length > 0 && (
        <ul aria-label={searchMessages.activeFilters} className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <li key={chip.key}>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E5EBFB] px-2 py-1 text-xs font-semibold text-[#2449c6]">
                {chip.label}
                <Link
                  href={buildPropertiesHref(chip.next)}
                  aria-label={searchMessages.removeFilter(chip.label)}
                  className="leading-none hover:text-[#1a3699]"
                >
                  ×
                </Link>
              </span>
            </li>
          ))}
        </ul>
      )}

      <p aria-live="polite" className="ml-auto text-sm text-zinc-500">
        {catalogMessages.resultCount(total)}
      </p>
    </div>
  );
}
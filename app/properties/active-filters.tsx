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
      <p aria-live="polite" className="text-sm font-semibold text-zinc-900">
        {catalogMessages.resultCount(total)}
      </p>

      {chips.length > 0 && (
        <ul aria-label={searchMessages.activeFilters} className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <li key={chip.key}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5EBFB] py-1 pl-3 pr-1.5 text-sm text-[#2449c6]">
                {chip.label}
                <Link
                  href={buildPropertiesHref(chip.next)}
                  aria-label={searchMessages.removeFilter(chip.label)}
                  className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-[#cdd8f7]"
                >
                  ×
                </Link>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
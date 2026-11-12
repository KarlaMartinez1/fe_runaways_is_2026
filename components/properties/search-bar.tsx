"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button, Input } from "@/components/ui";
import { DateRangeField } from "@/components/properties/date-range-field";
import type { PropertyFilters } from "@/lib/api/types";
import {
  buildPropertiesHref,
  DATE_FILTER_MAX_DAYS,
  DATE_FILTER_WINDOW_DAYS,
  getDateRangeError,
} from "@/lib/filters/property-filters";
import { departments, getMunicipalities } from "@/lib/locations/el-salvador";
import { filterMessages, searchMessages } from "@/lib/messages/properties";
import { cn } from "@/lib/utils/cn";
import { addDaysIso, todayInElSalvador } from "@/lib/utils/dates";
import {
  getPriceRangeError,
  propertySearchSchema,
  type PropertySearchFormData,
} from "@/lib/validations/property-search";

type SearchBarProps = {
  filters: PropertyFilters;
  showPrice?: boolean;
};

const categoryOptions = ["PROPIEDAD", "EQUIPO"] as const;

const selectClass =
  "h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-gray-900 outline-none hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60";

function chipClass(active: boolean) {
  return cn(
    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
    active ? "bg-[#2449c6] text-white" : "bg-[#EEF1FA] text-[#2449c6] hover:bg-[#E2E8F8]",
  );
}

export function SearchBar({ filters, showPrice = true }: SearchBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<PropertySearchFormData>({
    resolver: zodResolver(propertySearchSchema),
    mode: "onChange",
    defaultValues: {
      q: filters.q ?? "",
      department: filters.department ?? "",
      municipality: filters.municipality ?? "",
      category: filters.category ?? "",
      noDeposit: filters.noDeposit ?? false,
      minPrice: filters.minPrice !== undefined ? String(filters.minPrice) : "",
      maxPrice: filters.maxPrice !== undefined ? String(filters.maxPrice) : "",
      startDate: filters.startDate ?? "",
      endDate: filters.endDate ?? "",
    },
  });

  const department = useWatch({ control, name: "department" });
  const category = useWatch({ control, name: "category" });
  const noDeposit = useWatch({ control, name: "noDeposit" });
  const minPrice = useWatch({ control, name: "minPrice" });
  const maxPrice = useWatch({ control, name: "maxPrice" });
  const startDate = useWatch({ control, name: "startDate" });
  const endDate = useWatch({ control, name: "endDate" });
  const municipalities = getMunicipalities(department);

  // H8: de hoy a hoy + 89 días, y el fin a máximo 30 días del inicio (contando ambos).
  const today = todayInElSalvador();
  const lastDay = addDaysIso(today, DATE_FILTER_WINDOW_DAYS - 1);
  const dateError = getDateRangeError(startDate ?? "", endDate ?? "", today);

  const priceRangeError = getPriceRangeError(minPrice ?? "", maxPrice ?? "");
  const priceError = errors.minPrice?.message ?? errors.maxPrice?.message ?? priceRangeError;
  const hasErrors = Boolean(
    errors.q || errors.minPrice || errors.maxPrice || priceRangeError || dateError,
  );

  const onSubmit = (values: PropertySearchFormData) => {
    if (getPriceRangeError(values.minPrice, values.maxPrice)) return;
    if (getDateRangeError(values.startDate, values.endDate)) return;
    const hasDates = Boolean(values.startDate && values.endDate);

    const href = buildPropertiesHref({
      ...filters,
      q: values.q || undefined,
      department: values.department || undefined,
      municipality: values.department && values.municipality ? values.municipality : undefined,
      category: values.category || undefined,
      noDeposit: values.noDeposit || undefined,
      minPrice: values.minPrice ? Number(values.minPrice) : undefined,
      maxPrice: values.maxPrice ? Number(values.maxPrice) : undefined,
      startDate: hasDates ? values.startDate : undefined,
      endDate: hasDates ? values.endDate : undefined,
    });
    startTransition(() => router.push(href));
  };

  return (
    <form role="search" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-300 bg-white p-4 md:flex-row md:items-start">
        <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.6fr]">
          <Input
            label={searchMessages.queryLabel}
            placeholder={searchMessages.queryPlaceholder}
            error={errors.q}
            {...register("q")}
          />

          <div className="flex flex-col">
            <label htmlFor="search-department" className="mb-1.5 text-sm font-semibold text-gray-900">
              {searchMessages.departmentLabel}
            </label>
            <select
              id="search-department"
              className={selectClass}
              {...register("department", { onChange: () => setValue("municipality", "") })}
            >
              <option value="">{searchMessages.all}</option>
              {departments.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="search-municipality" className="mb-1.5 text-sm font-semibold text-gray-900">
              {searchMessages.municipalityLabel}
            </label>
            <select
              id="search-municipality"
              className={selectClass}
              disabled={!department}
              {...register("municipality")}
            >
              <option value="">{searchMessages.all}</option>
              {municipalities.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            {!department && (
              <p className="mt-1 text-xs text-zinc-500">{searchMessages.selectDepartmentFirst}</p>
            )}
          </div>

          <div role="group" aria-labelledby="search-dates-label" className="flex flex-col">
            <span id="search-dates-label" className="mb-1.5 text-sm font-semibold text-gray-900">
              {searchMessages.datesLabel}
            </span>
            <DateRangeField
              labelledBy="search-dates-label"
              startDate={startDate ?? ""}
              endDate={endDate ?? ""}
              minDate={today}
              maxDate={lastDay}
              maxDays={DATE_FILTER_MAX_DAYS}
              onChange={(start, end) => {
                setValue("startDate", start, { shouldValidate: true });
                setValue("endDate", end, { shouldValidate: true });
              }}
            />
            {dateError && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                {dateError}
              </p>
            )}
          </div>
        </div>

        <div className="md:pt-[26px]">
          <Button
            type="submit"
            size="md"
            isLoading={isPending}
            disabled={hasErrors}
            fullWidth
            className="md:w-auto md:px-6"
            leftIcon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            }
          >
            {searchMessages.submit}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          {categoryOptions.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={category === value}
              onClick={() => setValue("category", category === value ? "" : value)}
              className={chipClass(category === value)}
            >
              {filterMessages.categoryChips[value]}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={noDeposit}
            onClick={() => setValue("noDeposit", !noDeposit)}
            className={chipClass(noDeposit)}
          >
            {filterMessages.noDeposit}
          </button>
        </div>

        {showPrice && (
          <div role="group" aria-label={searchMessages.priceLabel} className="flex flex-col gap-1.5 md:items-end">
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-500">{searchMessages.priceLabel}</span>
              <Input
                aria-label={searchMessages.priceMin}
                placeholder={searchMessages.priceMin}
                inputMode="decimal"
                autoComplete="off"
                containerClassName="w-32"
                {...register("minPrice")}
              />
              <span aria-hidden="true" className="text-zinc-400">
                –
              </span>
              <Input
                aria-label={searchMessages.priceMax}
                placeholder={searchMessages.priceMax}
                inputMode="decimal"
                autoComplete="off"
                containerClassName="w-32"
                {...register("maxPrice")}
              />
            </div>
            {priceError && (
              <p role="alert" className="text-xs font-medium text-red-600">
                {priceError}
              </p>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
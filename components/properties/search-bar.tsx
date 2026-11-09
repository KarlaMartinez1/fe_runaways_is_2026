"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button, Input } from "@/components/ui";
import type { PropertyFilters } from "@/lib/api/types";
import { buildPropertiesHref } from "@/lib/filters/property-filters";
import { departments, getMunicipalities } from "@/lib/locations/el-salvador";
import { filterMessages, searchMessages } from "@/lib/messages/properties";
import { cn } from "@/lib/utils/cn";
import {
  propertySearchSchema,
  type PropertySearchFormData,
} from "@/lib/validations/property-search";

type SearchBarProps = {
  filters: PropertyFilters;
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

export function SearchBar({ filters }: SearchBarProps) {
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
    },
  });

  const department = useWatch({ control, name: "department" });
  const category = useWatch({ control, name: "category" });
  const noDeposit = useWatch({ control, name: "noDeposit" });
  const municipalities = getMunicipalities(department);

  const onSubmit = (values: PropertySearchFormData) => {
    const href = buildPropertiesHref({
      ...filters,
      q: values.q || undefined,
      department: values.department || undefined,
      municipality: values.department && values.municipality ? values.municipality : undefined,
      category: values.category || undefined,
      noDeposit: values.noDeposit || undefined,
    });
    startTransition(() => router.push(href));
  };

  return (
    <form role="search" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-300 bg-white md:flex-row">
        <div className="grid flex-1 gap-4 p-4 sm:grid-cols-3">
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
        </div>

        <Button
          type="submit"
          size="lg"
          isLoading={isPending}
          disabled={Boolean(errors.q)}
          className="rounded-none md:h-auto md:px-10"
          leftIcon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          }
        >
          {searchMessages.submit}
        </Button>
      </div>

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
    </form>
  );
}
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { Button, Input } from "@/components/ui";
import type { PropertyFilters } from "@/lib/api/types";
import { filtersToQuery } from "@/lib/filters/property-filters";
import { departments, getMunicipalities } from "@/lib/locations/el-salvador";
import { searchMessages } from "@/lib/messages/properties";
import {
  propertySearchSchema,
  type PropertySearchFormData,
} from "@/lib/validations/property-search";

type SearchBarProps = {
  filters: PropertyFilters;
};

const selectClass =
  "h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-gray-900 outline-none hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60";

export function SearchBar({ filters }: SearchBarProps) {
const router = useRouter();
   const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PropertySearchFormData>({
    resolver: zodResolver(propertySearchSchema),
    mode: "onChange",
    defaultValues: {
      q: filters.q ?? "",
      department: filters.department ?? "",
      municipality: filters.municipality ?? "",
    },
  });
const department = useWatch({ control, name: "department" });
  const municipalities = getMunicipalities(department);

  const onSubmit = (values: PropertySearchFormData) => {
    const query = filtersToQuery({
      ...filters,
      q: values.q || undefined,
      department: values.department || undefined,
      municipality: values.department && values.municipality ? values.municipality : undefined,
    });
    const params = new URLSearchParams(query);
    router.push(`/properties${params.size ? `?${params.toString()}` : ""}`);
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col overflow-hidden rounded-2xl border border-zinc-300 bg-white md:flex-row"
    >
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
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        isLoading={isSubmitting}
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
    </form>
  );
}
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { createProperty } from "@/app/actions/properties";
import { PhotoPicker, type PhotoItem } from "@/components/properties/photo-picker";
import { Button } from "@/components/ui";
import { departments, getMunicipalities } from "@/lib/locations/el-salvador";
import { categoryLabels, formatPrice, propertyMessages } from "@/lib/messages/properties";
import { propertyFormMessages as m } from "@/lib/messages/property-form";
import { imageStorage } from "@/lib/storage";
import { cn } from "@/lib/utils/cn";
import {
  ADDRESS_MAX,
  DESCRIPTION_MAX,
  getPhotoCountError,
  getPhotoFileError,
  PHOTO_MAX_COUNT,
  propertyFormSchema,
   TITLE_MAX,
  type PropertyFormData,
  type PropertyFormInput,
} from "@/lib/validations/property-form";

const categoryStyles = {
  PROPIEDAD: "bg-[#E5EBFB] text-[#2449c6]",
  EQUIPO: "bg-[#EEF0E2] text-zinc-800",
};

function controlClass(invalid: boolean) {
  return cn(
    "w-full rounded-xl border bg-white px-3.5 text-sm text-gray-900 outline-none focus:ring-2",
    "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60",
    invalid
      ? "border-red-500 focus:ring-red-100"
      : "border-gray-300 hover:border-gray-400 focus:border-blue-600 focus:ring-blue-100",
  );
}

type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  counter?: string;
  children: ReactNode;
};

// Etiqueta + control + línea inferior (error o ayuda a la izquierda, contador a la derecha).
function Field({ id, label, required, error, hint, counter, children }: FieldProps) {
  const message = error ?? hint;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-zinc-900">
        {required && <span aria-hidden="true">* </span>}
        {label}
      </label>
      {children}
      {(message || counter) && (
        <div className="flex justify-between gap-3 text-xs">
          <span id={`${id}-message`} className={error ? "font-medium text-red-600" : "text-zinc-500"}>
            {message}
          </span>
          {counter && <span className="shrink-0 text-zinc-500">{counter}</span>}
        </div>
      )}
    </div>
  );
}

export function PropertyForm() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [photoError, setPhotoError] = useState<string>();
  const [serverError, setServerError] = useState<string>();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormInput, unknown, PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      category: "",
      department: "",
      municipality: "",
      address: "",
      pricePerDay: "",
      securityDeposit: "",
    },
  });

  const [title, description, category, department, municipality, address, pricePerDay] = useWatch({
    control,
    name: ["title", "description", "category", "department", "municipality", "address", "pricePerDay"],
  });

  const municipalities = getMunicipalities(department);
  const hasErrors = Object.keys(errors).length > 0;
  const trimmedPrice = pricePerDay.trim();
  const previewPrice = /^\d+(\.\d+)?$/.test(trimmedPrice) ? formatPrice(trimmedPrice) : "$0.00";

  const handleAddPhotos = (files: File[]) => {
    const available = PHOTO_MAX_COUNT - photos.length;
    const accepted: PhotoItem[] = [];
    let error: string | undefined;

    for (const file of files) {
      const fileError = getPhotoFileError(file);
      if (fileError) {
        error = fileError;
        continue;
      }
      if (accepted.length >= available) {
        error = m.photosMax;
        break;
      }
      accepted.push({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) });
    }

    setPhotos((current) => [...current, ...accepted]);
    setPhotoError(error);
  };

  const handleRemovePhoto = (id: string) => {
    const removed = photos.find((photo) => photo.id === id);
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    setPhotos((current) => current.filter((photo) => photo.id !== id));
    setPhotoError(undefined);
  };

  const onSubmit = async (values: PropertyFormData) => {
    setServerError(undefined);

    const countError = getPhotoCountError(photos.length);
    if (countError) {
      setPhotoError(countError);
      return;
    }

    let imageUrls: string[];
    try {
      imageUrls = await Promise.all(photos.map((photo) => imageStorage.uploadPropertyImage(photo.file)));
    } catch (error) {
      console.error("Error al subir las fotos:", error);
      setServerError(m.saveError);
      return;
    }

    // Si se publica con éxito, la acción redirige a "Mis publicaciones".
    const result = await createProperty(values, imageUrls);
    if (result && !result.ok) {
      setServerError(result.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-16"
    >
      <div className="flex flex-col gap-10">
        <section aria-labelledby="basic-section" className="flex flex-col gap-5">
          <h2 id="basic-section" className="text-base font-semibold text-zinc-900">
            {m.basicSection}
          </h2>

          <Field
            id="property-title"
            label={m.titleLabel}
            required
            error={errors.title?.message}
            counter={m.counter(title.length, TITLE_MAX)}
          >
            <input
              id="property-title"
              maxLength={TITLE_MAX}
              aria-required="true"
              aria-invalid={Boolean(errors.title)}
              aria-describedby="property-title-message"
              className={cn(controlClass(Boolean(errors.title)), "h-11")}
              {...register("title")}
            />
          </Field>

          <Field
            id="property-description"
            label={m.descriptionLabel}
            required
            error={errors.description?.message}
            counter={m.counter(description.length, DESCRIPTION_MAX)}
          >
            <textarea
              id="property-description"
              rows={4}
              maxLength={DESCRIPTION_MAX}
              aria-required="true"
              aria-invalid={Boolean(errors.description)}
              aria-describedby="property-description-message"
              className={cn(controlClass(Boolean(errors.description)), "resize-y py-3")}
              {...register("description")}
            />
          </Field>

          <div className="sm:max-w-[240px]">
            <Field id="property-category" label={m.categoryLabel} required error={errors.category?.message}>
              <select
                id="property-category"
                aria-required="true"
                aria-invalid={Boolean(errors.category)}
                aria-describedby="property-category-message"
                className={cn(controlClass(Boolean(errors.category)), "h-11")}
                {...register("category")}
              >
                <option value="">{m.categoryPlaceholder}</option>
                <option value="PROPIEDAD">{categoryLabels.PROPIEDAD}</option>
                <option value="EQUIPO">{categoryLabels.EQUIPO}</option>
              </select>
            </Field>
          </div>
        </section>

        <section aria-labelledby="location-section" className="flex flex-col gap-5">
          <h2 id="location-section" className="text-base font-semibold text-zinc-900">
            {m.locationSection}
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="property-department"
              label={m.departmentLabel}
              required
              error={errors.department?.message}
            >
              <select
                id="property-department"
                aria-required="true"
                aria-invalid={Boolean(errors.department)}
                aria-describedby="property-department-message"
                className={cn(controlClass(Boolean(errors.department)), "h-11")}
                {...register("department", { onChange: () => setValue("municipality", "") })}
              >
                <option value="">{m.departmentPlaceholder}</option>
                {departments.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              id="property-municipality"
              label={m.municipalityLabel}
              required
              error={errors.municipality?.message}
            >
              <select
                id="property-municipality"
                disabled={!department}
                aria-required="true"
                aria-invalid={Boolean(errors.municipality)}
                aria-describedby="property-municipality-message"
                className={cn(controlClass(Boolean(errors.municipality)), "h-11")}
                {...register("municipality")}
              >
                <option value="">{m.municipalityPlaceholder}</option>
                {municipalities.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field
            id="property-address"
            label={m.addressLabel}
            required
            error={errors.address?.message}
            counter={m.counter(address.length, ADDRESS_MAX)}
          >
            <textarea
              id="property-address"
              rows={3}
              maxLength={ADDRESS_MAX}
              aria-required="true"
              aria-invalid={Boolean(errors.address)}
              aria-describedby="property-address-message"
              className={cn(controlClass(Boolean(errors.address)), "resize-y py-3")}
              {...register("address")}
            />
          </Field>

          <p className="rounded-xl bg-[#EEF0E2] px-4 py-3 text-sm text-zinc-800">{m.addressNote}</p>
        </section>

        <section aria-labelledby="prices-section" className="flex flex-col gap-5">
          <h2 id="prices-section" className="text-base font-semibold text-zinc-900">
            {m.pricesSection}
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="property-price" label={m.priceLabel} required error={errors.pricePerDay?.message}>
              <div className="relative">
                <span aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                  $
                </span>
                <input
                  id="property-price"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0.00"
                  aria-required="true"
                  aria-invalid={Boolean(errors.pricePerDay)}
                  aria-describedby="property-price-message"
                  className={cn(controlClass(Boolean(errors.pricePerDay)), "h-11 pl-7")}
                  {...register("pricePerDay")}
                />
              </div>
            </Field>

            <Field
              id="property-deposit"
              label={m.depositLabel}
              error={errors.securityDeposit?.message}
              hint={m.depositHint}
            >
              <div className="relative">
                <span aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                  $
                </span>
                <input
                  id="property-deposit"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0.00"
                  aria-invalid={Boolean(errors.securityDeposit)}
                  aria-describedby="property-deposit-message"
                  className={cn(controlClass(Boolean(errors.securityDeposit)), "h-11 pl-7")}
                  {...register("securityDeposit")}
                />
              </div>
            </Field>
          </div>
        </section>
      </div>

      <aside aria-labelledby="preview-title" className="flex flex-col gap-3 lg:sticky lg:top-8 lg:self-start">
        <p id="preview-title" className="text-sm font-semibold text-zinc-700">
          {m.previewTitle}
        </p>
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {photos[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photos[0].previewUrl} alt="" className="h-[190px] w-full object-cover" />
          ) : (
            <div aria-hidden="true" className="h-[190px] bg-zinc-100" />
          )}
          <div className="flex flex-col gap-1 p-4">
            {category && (
              <span className={cn("self-start rounded-md px-2 py-0.5 text-xs font-semibold", categoryStyles[category])}>
                {categoryLabels[category]}
              </span>
            )}
            <p className="font-semibold text-zinc-900">{title.trim() || m.previewPlaceholderTitle}</p>
            {department && municipality && (
              <p className="text-xs text-zinc-500">
                {municipality}, {department}
              </p>
            )}
            <p className="text-sm font-bold text-zinc-900">
              {previewPrice} {propertyMessages.perDay}
            </p>
          </div>
        </div>
      </aside>

      <section aria-labelledby="photos-section" className="flex flex-col gap-4 lg:col-span-2">
        <h2 id="photos-section" className="text-base font-semibold text-zinc-900">
          {m.photosSection}
        </h2>
        <PhotoPicker photos={photos} error={photoError} onAdd={handleAddPhotos} onRemove={handleRemovePhoto} />
      </section>

      <div className="flex flex-col gap-4 lg:col-span-2">
        {serverError && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {serverError}
          </p>
        )}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="rounded-xl bg-[#EEF0E2] px-4 py-3 text-sm text-zinc-800">
            {m.availabilityNote} <span className="font-semibold">{m.availabilityLink}</span>
          </p>
          <div className="flex justify-end gap-3">
            <Button asChild variant="outline">
              <Link href="/properties/mine">{m.cancel}</Link>
            </Button>
            <Button type="submit" isLoading={isSubmitting} disabled={hasErrors}>
              {isSubmitting ? m.publishing : m.publish}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
  
}

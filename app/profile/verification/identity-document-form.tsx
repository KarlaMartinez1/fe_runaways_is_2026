"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type DragEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { submitIdentityDocument } from "@/app/actions/identity-document";
import { Button } from "@/components/ui";
import type { IdentityDocumentInfo } from "@/lib/api/types";
import { identityDocumentMessages as m } from "@/lib/messages/identity-document";
import { cn } from "@/lib/utils/cn";
import {
  DOCUMENT_TYPES,
  getDocumentFileError,
  identityDocumentSchema,
  type IdentityDocumentFormData,
} from "@/lib/validations/identity-document";

function controlClass(invalid: boolean) {
  return cn(
    "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-gray-900 outline-none focus:ring-2",
    invalid
      ? "border-red-500 focus:ring-red-100"
      : "border-gray-300 hover:border-gray-400 focus:border-blue-600 focus:ring-blue-100",
  );
}

type IdentityDocumentFormProps = {
  // Se llama cuando el documento se envía con éxito, con el estado nuevo de la cuenta.
  onSubmitted: (info: IdentityDocumentInfo) => void;
};

// H19: formulario para subir el documento de identidad.
export function IdentityDocumentForm({ onSubmitted }: IdentityDocumentFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [fileError, setFileError] = useState<string>();
  const [serverError, setServerError] = useState<string>();
  const [isDragging, setIsDragging] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<IdentityDocumentFormData>({
    resolver: zodResolver(identityDocumentSchema),
    mode: "onChange",
    defaultValues: { documentType: "DUI", documentNumber: "" },
  });

  const documentType = useWatch({ control, name: "documentType" });

  // Libera la vista previa anterior cuando cambia el archivo o se cierra el formulario.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const selectFile = (selected: File | undefined) => {
    if (!selected) return;
    const error = getDocumentFileError(selected);
    setServerError(undefined);
    if (error) {
      setFile(null);
      setPreviewUrl(undefined);
      setFileError(error);
      return;
    }
    setFile(selected);
    setFileError(undefined);
    // Vista previa solo para imágenes; del PDF se muestra el nombre.
    setPreviewUrl(selected.type.startsWith("image/") ? URL.createObjectURL(selected) : undefined);
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(undefined);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files[0]);
  };

  const onSubmit = async (values: IdentityDocumentFormData) => {
    setServerError(undefined);

    const error = getDocumentFileError(file);
    if (error || !file) {
      setFileError(error);
      return;
    }

    const formData = new FormData();
    formData.append("documentType", values.documentType);
    formData.append("documentNumber", values.documentNumber);
    formData.append("file", file);

    const result = await submitIdentityDocument(formData);
    if (!result.ok) {
      setServerError(result.message);
      return;
    }
    onSubmitted(result.info);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-labelledby="verification-form-title"
      className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6"
    >
      <h2 id="verification-form-title" className="text-lg font-semibold text-zinc-900">
        {m.formTitle}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="document-type" className="text-sm font-medium text-zinc-900">
            {m.typeLabel}
          </label>
          <select
            id="document-type"
            aria-invalid={Boolean(errors.documentType)}
            className={controlClass(Boolean(errors.documentType))}
            {...register("documentType", {
              // Al cambiar el tipo, se vuelve a revisar el formato del número ya escrito.
              onChange: () => {
                if (getValues("documentNumber")) void trigger("documentNumber");
              },
            })}
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {m.typeOptions[type]}
              </option>
            ))}
          </select>
          {errors.documentType && (
            <p className="text-xs font-medium text-red-600">{errors.documentType.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="document-number" className="text-sm font-medium text-zinc-900">
            {m.numberLabel}
          </label>
          <input
            id="document-number"
            autoComplete="off"
            placeholder={documentType === "DUI" ? m.duiPlaceholder : undefined}
            aria-invalid={Boolean(errors.documentNumber)}
            aria-describedby="document-number-error"
            className={controlClass(Boolean(errors.documentNumber))}
            {...register("documentNumber")}
          />
          {errors.documentNumber && (
            <p id="document-number-error" className="text-xs font-medium text-red-600">
              {errors.documentNumber.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span id="document-file-label" className="text-sm font-medium text-zinc-900">
          {m.fileLabel}
        </span>
        <label
          aria-labelledby="document-file-label"
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex min-h-[170px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-4 text-center",
            "bg-[#EEF1FB] focus-within:border-[#1d4ed8]",
            isDragging ? "border-[#1d4ed8]" : fileError ? "border-red-500" : "border-[#B9C3EA]",
          )}
        >
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={m.previewAlt} className="max-h-40 rounded-lg object-contain" />
          )}
          <span className="text-sm font-semibold text-[#1d4ed8]">{m.dropzone}</span>
          {file && <span className="text-xs text-zinc-600">{file.name}</span>}
          <input
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            className="sr-only"
            onChange={(event) => {
              selectFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
        <div className="flex items-start justify-between gap-3">
          {fileError ? (
            <p role="alert" className="text-xs font-medium text-red-600">
              {fileError}
            </p>
          ) : (
            <span />
          )}
          {file && (
            <button
              type="button"
              onClick={removeFile}
              className="text-xs font-medium text-[#1d4ed8] underline underline-offset-2"
            >
              {m.removeFile}
            </button>
          )}
        </div>
      </div>

      {serverError && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {serverError}
        </p>
      )}

      <Button type="submit" fullWidth isLoading={isSubmitting}>
        {isSubmitting ? m.submitting : m.submit}
      </Button>
    </form>
  );
}
"use client";

import { propertyFormMessages as m } from "@/lib/messages/property-form";
import { PHOTO_MAX_COUNT } from "@/lib/validations/property-form";

export type PhotoItem = {
  id: string;
  file: File;
  previewUrl: string;
};

type PhotoPickerProps = {
  photos: PhotoItem[];
  error?: string;
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
};

// Cuadrícula de 5 espacios para fotos: fotos elegidas, "+ Agregar" y espacios vacíos.
export function PhotoPicker({ photos, error, onAdd, onRemove }: PhotoPickerProps) {
  const canAdd = photos.length < PHOTO_MAX_COUNT;
  const emptySlots = Math.max(0, PHOTO_MAX_COUNT - photos.length - (canAdd ? 1 : 0));

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {photos.map((photo, index) => (
          <div key={photo.id} className="relative aspect-[3/2] overflow-hidden rounded-xl bg-zinc-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.previewUrl} alt={m.photoAlt(index + 1)} className="h-full w-full object-cover" />
            {index === 0 && (
              <span className="absolute left-2 top-2 rounded-md bg-[#2449c6] px-2 py-0.5 text-xs font-semibold text-white">
                {m.cover}
              </span>
            )}
            <button
              type="button"
              onClick={() => onRemove(photo.id)}
              className="absolute bottom-2 right-2 rounded-md bg-white/90 px-2 py-0.5 text-sm font-medium text-[#2449c6] hover:bg-white"
            >
              {m.removePhoto}
            </button>
          </div>
        ))}

        {canAdd && (
          <label className="flex aspect-[3/2] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 text-sm text-zinc-700 hover:border-[#2449c6] hover:text-[#2449c6] focus-within:border-[#2449c6] focus-within:text-[#2449c6]">
            {m.addPhoto}
            <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              className="sr-only"
              onChange={(event) => {
                onAdd(Array.from(event.target.files ?? []));
                event.target.value = "";
              }}
            />
          </label>
        )}

        {Array.from({ length: emptySlots }, (_, index) => (
          <div
            key={`empty-${index}`}
            aria-hidden="true"
            className="aspect-[3/2] rounded-xl border-2 border-dashed border-zinc-200"
          />
        ))}
      </div>

      <p className="text-sm text-zinc-500">{m.photosHint}</p>
      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
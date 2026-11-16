"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";
import { propertyFormMessages as m } from "@/lib/messages/property-form";

type DeletePropertyDialogProps = {
  isOpen: boolean;
  title: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// H5: confirmación antes de eliminar un bien.
export function DeletePropertyDialog({
  isOpen,
  title,
  isLoading,
  onConfirm,
  onCancel,
}: DeletePropertyDialogProps) {
  // Cierra con Escape, salvo mientras se elimina.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-property-title"
    >
      <div className="fixed inset-0" aria-hidden="true" onClick={isLoading ? undefined : onCancel} />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <p id="delete-property-title" className="font-semibold text-zinc-900">
          {m.deleteConfirm(title)}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {m.cancel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            isLoading={isLoading}
            className="bg-red-600 hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-600"
          >
            {m.deleteConfirmButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
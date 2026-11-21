"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { changePropertyStatus, deleteProperty } from "@/app/actions/property-status";
import { PropertyForm } from "@/components/properties/property-form";
import { Button } from "@/components/ui";
import type { OwnerProperty } from "@/lib/api/types";
import { propertyFormMessages as m } from "@/lib/messages/property-form";
import { DeletePropertyDialog } from "./delete-property-dialog";

type PropertyManagerProps = {
  property: OwnerProperty;
};

// H5: pantalla de gestión. Agrega al formulario de H4 los botones para pausar,
// reactivar, bloquear fechas y eliminar, y muestra el error del servidor arriba.
export function PropertyManager({ property }: PropertyManagerProps) {
  const [isPaused, setIsPaused] = useState(property.status === "PAUSADO");
  const [error, setError] = useState<string>();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isChangingStatus, startStatusChange] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const handleToggleStatus = () => {
    setError(undefined);
    startStatusChange(async () => {
      const result = await changePropertyStatus(property.id, isPaused ? "DISPONIBLE" : "PAUSADO");
      if (result.ok) {
        setIsPaused(result.status === "PAUSADO");
      } else {
        setError(result.message);
      }
    });
  };

  const handleOpenDelete = () => {
    setError(undefined);
    setConfirmOpen(true);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
  };

  // Si se elimina con éxito, la acción redirige a "Mis publicaciones".
  const handleConfirmDelete = () => {
    startDelete(async () => {
      const result = await deleteProperty(property.id);
      if (result && !result.ok) {
        setConfirmOpen(false);
        setError(result.message);
      }
    });
  };

  const busy = isChangingStatus || isDeleting;

  const actions = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleToggleStatus}
        isLoading={isChangingStatus}
        disabled={busy}
      >
        {isPaused ? m.reactivate : m.pause}
      </Button>
      <Button asChild variant="outline">
        <Link href={`/properties/${property.id}/availability`}>{m.blockDates}</Link>
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={handleOpenDelete}
        disabled={busy}
        className="border-red-500 text-red-600 hover:bg-red-50 active:bg-red-100"
      >
        {m.deleteProperty}
      </Button>
    </>
  );

  return (
    <>
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-400 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      )}

      <PropertyForm property={property} actions={actions} />

      <DeletePropertyDialog
        isOpen={confirmOpen}
        title={property.title}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
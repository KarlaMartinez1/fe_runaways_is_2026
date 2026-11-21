"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { adminDocumentsMessages as m } from "@/lib/messages/admin-documents";
import { cn } from "@/lib/utils/cn";
import { isValidRejectionReason, REJECTION_REASON_MAX } from "@/lib/validations/document-review";

type RejectDocumentDialogProps = {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
};

// H20: cuadro para rechazar con motivo obligatorio (10 a 300 caracteres).
export function RejectDocumentDialog({ isOpen, isLoading, onConfirm, onCancel }: RejectDocumentDialogProps) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const isValid = isValidRejectionReason(reason);
  const showError = touched && !isValid;

  // Cierra con Escape, salvo mientras se envía.
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
      aria-labelledby="reject-document-title"
    >
      <div className="fixed inset-0" aria-hidden="true" onClick={isLoading ? undefined : onCancel} />

      <div className="relative z-10 flex w-full max-w-md flex-col gap-3 rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="reject-document-title" className="text-lg font-semibold text-zinc-900">
          {m.rejectTitle}
        </h2>

        <label htmlFor="rejection-reason" className="text-sm font-medium text-zinc-900">
          {m.reasonLabel}
        </label>
        <textarea
          id="rejection-reason"
          rows={4}
          maxLength={REJECTION_REASON_MAX}
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            setTouched(true);
          }}
          aria-invalid={showError}
          aria-describedby="rejection-reason-message"
          className={cn(
            "w-full resize-y rounded-xl border px-3.5 py-3 text-sm text-gray-900 outline-none focus:ring-2",
            showError
              ? "border-red-500 focus:ring-red-100"
              : "border-gray-300 focus:border-blue-600 focus:ring-blue-100",
          )}
        />
        <div className="flex justify-between gap-3 text-xs">
          <span id="rejection-reason-message" className="font-medium text-red-600">
            {showError ? m.reasonLength : ""}
          </span>
          <span className="shrink-0 text-zinc-500">{m.reasonCounter(reason.length)}</span>
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {m.cancel}
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={!isValid}
            isLoading={isLoading}
            className="bg-red-600 hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-600"
          >
            {m.confirmReject}
          </Button>
        </div>
      </div>
    </div>
  );
}
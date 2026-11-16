"use client";

import { useState, useTransition } from "react";
import { approveDocument, rejectDocument } from "@/app/actions/admin-documents";
import { Button } from "@/components/ui";
import { adminDocumentsMessages as m } from "@/lib/messages/admin-documents";
import { RejectDocumentDialog } from "./reject-document-dialog";

type ReviewActionsProps = {
  userId: string;
};

// H20: botones "Aprobar" (verde) y "Rechazar" (rojo). Si la acción sale bien,
// el servidor redirige a la lista con el mensaje del resultado.
export function ReviewActions({ userId }: ReviewActionsProps) {
  const [error, setError] = useState<string>();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [isApproving, startApprove] = useTransition();
  const [isRejecting, startReject] = useTransition();
  const busy = isApproving || isRejecting;

  const handleApprove = () => {
    setError(undefined);
    startApprove(async () => {
      const result = await approveDocument(userId);
      if (result && !result.ok) setError(result.message);
    });
  };

  const handleConfirmReject = (reason: string) => {
    startReject(async () => {
      const result = await rejectDocument(userId, reason);
      if (result && !result.ok) {
        setRejectOpen(false);
        setError(result.message);
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <Button
        type="button"
        fullWidth
        onClick={handleApprove}
        isLoading={isApproving}
        disabled={busy}
        className="bg-[#15803d] hover:bg-[#166534] active:bg-[#14532d] focus-visible:ring-[#15803d]"
      >
        {m.approve}
      </Button>
      <Button
        type="button"
        fullWidth
        onClick={() => {
          setError(undefined);
          setRejectOpen(true);
        }}
        disabled={busy}
        className="bg-red-600 hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-600"
      >
        {m.reject}
      </Button>

      {rejectOpen && (
        <RejectDocumentDialog
          isOpen={rejectOpen}
          isLoading={isRejecting}
          onConfirm={handleConfirmReject}
          onCancel={() => setRejectOpen(false)}
        />
      )}
    </div>
  );
}
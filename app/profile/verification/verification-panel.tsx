"use client";

import { useState } from "react";
import type { IdentityDocumentInfo } from "@/lib/api/types";
import { identityDocumentMessages as m } from "@/lib/messages/identity-document";
import { IdentityDocumentForm } from "./identity-document-form";
import { VerificationStatusCard } from "./verification-status-card";

type VerificationPanelProps = {
  initialInfo: IdentityDocumentInfo;
};

// H19: decide qué se muestra según el estado de la cuenta.
// SIN_VERIFICAR: formulario. PENDIENTE y VERIFICADA: solo el estado.
// RECHAZADA: estado con motivo y "Subir nuevo documento", que abre el formulario.
export function VerificationPanel({ initialInfo }: VerificationPanelProps) {
  const [info, setInfo] = useState(initialInfo);
  const [showForm, setShowForm] = useState(initialInfo.accountStatus === "SIN_VERIFICAR");
  const [justSubmitted, setJustSubmitted] = useState(false);

  const handleSubmitted = (newInfo: IdentityDocumentInfo) => {
    setInfo(newInfo);
    setShowForm(false);
    setJustSubmitted(true);
  };

  return (
    <div className="flex flex-col gap-4">
      {justSubmitted && (
        <p role="status" className="rounded-xl bg-[#dcfce7] px-4 py-3 text-sm font-medium text-[#14532d]">
          {m.submitted}
        </p>
      )}

      <div
        className={
          showForm
            ? "grid items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"
            : "max-w-xl"
        }
      >
        {showForm && <IdentityDocumentForm onSubmitted={handleSubmitted} />}
        <VerificationStatusCard
          info={info}
          showUploadNew={!showForm}
          onUploadNew={() => setShowForm(true)}
        />
      </div>
    </div>
  );
}

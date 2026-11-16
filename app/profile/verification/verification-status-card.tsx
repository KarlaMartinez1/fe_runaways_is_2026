import type { AccountStatus, IdentityDocumentInfo } from "@/lib/api/types";
import { identityDocumentMessages as m } from "@/lib/messages/identity-document";
import { accountStatusDisplayLabels } from "@/lib/messages/profile";
import { Button } from "@/components/ui";

const statusStyles: Record<AccountStatus, string> = {
  SIN_VERIFICAR: "bg-[#FDE7D3] text-[#9a3412]",
  PENDIENTE: "bg-[#fef3c7] text-[#854d0e]",
  VERIFICADA: "bg-[#dcfce7] text-[#166534]",
  RECHAZADA: "bg-[#fee2e2] text-[#991b1b]",
};

type VerificationStatusCardProps = {
  info: IdentityDocumentInfo;
  // H19: si la cuenta fue rechazada, el botón vuelve a mostrar el formulario.
  onUploadNew?: () => void;
  showUploadNew: boolean;
};

// H19: tarjeta "Estado de verificación" con la insignia del estado de la cuenta.
export function VerificationStatusCard({ info, onUploadNew, showUploadNew }: VerificationStatusCardProps) {
  const status = info.accountStatus;
  const showReviewInfo = status === "SIN_VERIFICAR" || status === "PENDIENTE";

  return (
    <section
      aria-labelledby="verification-status-title"
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6"
    >
      <h2 id="verification-status-title" className="text-lg font-semibold text-zinc-900">
        {m.statusTitle}
      </h2>

      <span className={`self-start rounded-md px-2.5 py-0.5 text-xs font-semibold ${statusStyles[status]}`}>
        {accountStatusDisplayLabels[status]}
      </span>

      {showReviewInfo && <p className="text-sm text-zinc-600">{m.reviewInfo}</p>}

      {status === "RECHAZADA" && info.rejectionReason && (
        <p className="text-sm text-zinc-900">
          <span className="font-semibold">{m.rejectionLabel}</span> {info.rejectionReason}
        </p>
      )}

      {status === "RECHAZADA" && showUploadNew && (
        <Button type="button" onClick={onUploadNew} className="self-start">
          {m.uploadNew}
        </Button>
      )}

      {status !== "VERIFICADA" && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-zinc-900">{m.requirementsTitle}</h3>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-zinc-700">
            {m.requirements.map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
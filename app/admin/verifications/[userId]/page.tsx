import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { getCurrentUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { IdentityDocumentReview, IdentityDocumentStatus } from "@/lib/api/types";
import { adminDocumentsMessages as m, documentStatusLabels } from "@/lib/messages/admin-documents";
import { identityDocumentMessages } from "@/lib/messages/identity-document";
import { adminRepository } from "@/lib/repositories";
import { formatDateTime } from "@/lib/utils/date-time";
import { DocumentViewer } from "./document-viewer";
import { ReviewActions } from "./review-actions";

export const metadata: Metadata = {
  title: "Revisar documento | Runaways",
};

const statusStyles: Record<IdentityDocumentStatus, string> = {
  PENDIENTE: "bg-[#fef3c7] text-[#854d0e]",
  APROBADO: "bg-[#dcfce7] text-[#166534]",
  RECHAZADO: "bg-[#fee2e2] text-[#991b1b]",
};

type ReviewDocumentPageProps = {
  params: Promise<{ userId: string }>;
};

export default async function ReviewDocumentPage({ params }: ReviewDocumentPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  // H20: solo el ADMIN revisa documentos.
  if (user.role !== "ADMIN") {
    redirect("/access-denied");
  }

  const { userId } = await params;

  let review: IdentityDocumentReview | null = null;
  let unauthorized = false;
  let loadFailed = false;
  try {
    review = await adminRepository.getDocument(userId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else if (error instanceof ApiError && error.status === 403) {
      redirect("/access-denied");
    } else {
      console.error("Error al cargar el documento:", error);
      loadFailed = true;
    }
  }

  if (unauthorized) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-6 py-8 md:px-16">
        <Link
          href="/admin/verifications"
          className="inline-flex items-center gap-1 self-start text-sm text-zinc-700 hover:text-[#1d4ed8]"
        >
          <span aria-hidden="true">←</span>
          {m.backToList}
        </Link>

        <h1 className="text-2xl font-semibold text-zinc-900">{m.reviewTitle}</h1>

        {!review ? (
          <p role="alert" className="py-16 text-center text-zinc-600">
            {loadFailed ? m.reviewLoadError : m.notFound}
          </p>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <DocumentViewer fileUrl={review.fileUrl} title={m.documentTitle(review.name)} />

            <aside className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
              <div>
                <p className="font-semibold text-zinc-900">{review.name}</p>
                <p className="text-sm text-zinc-500">{review.email}</p>
              </div>

              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-xl bg-zinc-50 p-4 text-sm">
                <dt className="text-zinc-500">{m.typeLabel}</dt>
                <dd className="text-right text-zinc-900">
                  {identityDocumentMessages.typeOptions[review.documentType]}
                </dd>
                <dt className="text-zinc-500">{m.numberLabel}</dt>
                <dd className="text-right text-zinc-900">{review.documentNumber}</dd>
                <dt className="text-zinc-500">{m.submittedLabel}</dt>
                <dd className="text-right text-zinc-900">{formatDateTime(review.documentSubmittedAt)}</dd>
                <dt className="text-zinc-500">{m.statusLabel}</dt>
                <dd className="text-right">
                  <span
                    className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${statusStyles[review.documentStatus]}`}
                  >
                    {documentStatusLabels[review.documentStatus]}
                  </span>
                </dd>
              </dl>

              {review.documentStatus === "PENDIENTE" ? (
                <ReviewActions userId={review.userId} />
              ) : (
                <p className="text-sm text-zinc-600">{m.alreadyReviewed}</p>
              )}
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
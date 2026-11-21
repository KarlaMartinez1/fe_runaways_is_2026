import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui";
import { Pagination } from "@/components/ui/pagination";
import { getCurrentUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { PendingIdentityDocumentList } from "@/lib/api/types";
import { adminDocumentsMessages as m } from "@/lib/messages/admin-documents";
import { identityDocumentMessages } from "@/lib/messages/identity-document";
import { adminRepository } from "@/lib/repositories";
import { formatDateTime } from "@/lib/utils/date-time";

export const metadata: Metadata = {
  title: "Revisión de documentos | Runaways",
};

type AdminVerificationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parsePage(value: string | string[] | undefined) {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

const resultMessages: Record<string, string> = {
  approved: m.approved,
  rejected: m.rejected,
};

export default async function AdminVerificationsPage({ searchParams }: AdminVerificationsPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  // H20: solo el ADMIN revisa documentos.
  if (user.role !== "ADMIN") {
    redirect("/access-denied");
  }

  const params = await searchParams;
  const page = parsePage(params.page);
  // La revisión redirige aquí con ?result=approved o ?result=rejected.
  const resultMessage = typeof params.result === "string" ? resultMessages[params.result] : undefined;

  let result: PendingIdentityDocumentList | null = null;
  let unauthorized = false;
  try {
    result = await adminRepository.listPendingDocuments(page);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else if (error instanceof ApiError && error.status === 403) {
      redirect("/access-denied");
    } else {
      console.error("Error al cargar los documentos pendientes:", error);
    }
  }

  if (unauthorized) {
    redirect("/login");
  }

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;
  if (result && result.data.length === 0 && page > 1) {
    redirect("/admin/verifications");
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-8 px-6 py-10 md:px-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-3xl font-bold text-zinc-900">{m.listTitle}</h1>
            {result && <span className="text-sm text-zinc-500">{m.pendingCount(result.total)}</span>}
          </div>
          {resultMessage && (
            <p role="status" className="rounded-lg bg-[#dcfce7] px-4 py-2 text-sm font-medium text-[#14532d]">
              {resultMessage}
            </p>
          )}
        </div>

        {!result ? (
          <p role="alert" className="py-16 text-center text-zinc-600">
            {m.listLoadError}
          </p>
        ) : result.data.length === 0 ? (
          <p className="py-16 text-center text-zinc-600">{m.empty}</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">{m.userColumn}</th>
                    <th scope="col" className="px-5 py-3 font-medium">{m.typeColumn}</th>
                    <th scope="col" className="px-5 py-3 font-medium">{m.numberColumn}</th>
                    <th scope="col" className="px-5 py-3 font-medium">{m.submittedColumn}</th>
                    <th scope="col" className="px-5 py-3">
                      <span className="sr-only">{m.review}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {result.data.map((item) => (
                    <tr key={item.userId}>
                      <td className="px-5 py-3">
                        <p className="font-medium text-zinc-900">{item.name}</p>
                        <p className="text-zinc-500">{item.email}</p>
                      </td>
                      <td className="px-5 py-3 text-zinc-900">
                        {identityDocumentMessages.typeOptions[item.documentType]}
                      </td>
                      <td className="px-5 py-3 text-zinc-900">{item.documentNumber}</td>
                      <td className="px-5 py-3 text-zinc-900">
                        {formatDateTime(item.documentSubmittedAt)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button asChild size="sm">
                          <Link href={`/admin/verifications/${encodeURIComponent(item.userId)}`}>
                            {m.review}
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={result.page} totalPages={totalPages} basePath="/admin/verifications" />
          </>
        )}
      </main>
    </>
  );
}

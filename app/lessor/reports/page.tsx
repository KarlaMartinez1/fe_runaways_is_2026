import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { ReportsPageBody } from "@/components/reports/reports-page-body";
import { reportRepository } from "@/lib/repositories";
import { ApiError } from "@/lib/api/client";
import { reportMessages } from "@/lib/messages/reports";
import type {
  IncomeSummary,
  PropertyIncomeListResult,
} from "@/lib/repositories/report-repository";

export const metadata: Metadata = {
  title: "Reportes de ingresos | Runaways",
  description: "Consulta los ingresos totales y el desglose de ingresos por bien.",
};

interface LessorReportsPageProps {
  searchParams?: Promise<{
    from?: string;
    to?: string;
    order?: string;
    page?: string;
  }>;
}

export default async function LessorReportsPage({
  searchParams,
}: LessorReportsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const from = resolvedParams.from || undefined;
  const to = resolvedParams.to || undefined;
  const order = resolvedParams.order === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number(resolvedParams.page) || 1);

  let summary: IncomeSummary | null = null;
  let propertyIncome: PropertyIncomeListResult | null = null;
  let forbidden = false;

  try {
    [summary, propertyIncome] = await Promise.all([
      reportRepository.getIncomeSummary({ from, to }),
      reportRepository.getIncomeByProperty({
        from,
        to,
        order,
        page,
        pageSize: 10,
      }),
    ]);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        redirect("/login");
      }
      if (error.status === 403) {
        forbidden = true;
      }
    }
    console.error("Error al cargar reportes de ingresos:", error);
  }

  if (forbidden) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
        <Navbar />
        <main className="mx-auto flex flex-1 w-full max-w-[1200px] flex-col items-center justify-center px-4 py-16 text-center">
          <h2 className="text-xl font-bold text-zinc-900">
            {reportMessages.errors.forbidden}
          </h2>
        </main>
      </div>
    );
  }

  const initialSummary: IncomeSummary = summary ?? {
    from: from ?? null,
    to: to ?? null,
    rentalIncome: "0.00",
    retainedDepositIncome: "0.00",
    totalIncome: "0.00",
  };

  const initialPropertyIncome: PropertyIncomeListResult = propertyIncome ?? {
    data: [],
    totalIncome: "0.00",
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <Navbar />
      <ReportsPageBody
        initialSummary={initialSummary}
        initialPropertyIncome={initialPropertyIncome}
        initialFrom={from ?? ""}
        initialTo={to ?? ""}
        initialOrder={order}
      />
    </div>
  );
}

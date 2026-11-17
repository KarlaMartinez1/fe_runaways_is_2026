import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { ReportsPageBody } from "@/components/reports/reports-page-body";
import { getCurrentUser } from "@/lib/api/auth";
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

interface OwnerReportsPageProps {
  searchParams?: Promise<{
    from?: string;
    to?: string;
    order?: string;
    page?: string;
  }>;
}

export default async function OwnerReportsPage({
  searchParams,
}: OwnerReportsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const from = resolvedParams.from || undefined;
  const to = resolvedParams.to || undefined;
  const order = resolvedParams.order === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number(resolvedParams.page) || 1);

  let forbidden = false;

  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/login");
    }
    if (user.role !== "OWNER") {
      forbidden = true;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        redirect("/login");
      }
      if (error.status === 403) {
        forbidden = true;
      }
    }
    console.error("Error al verificar perfil de usuario:", error);
  }

  let summary: IncomeSummary | null = null;
  let propertyIncome: PropertyIncomeListResult | null = null;

  if (!forbidden) {
    try {
      const hasDateFilter = Boolean(from || to);
      const summaryPromise = hasDateFilter
        ? reportRepository.getIncomeSummary({ from, to })
        : Promise.resolve({
            from: null,
            to: null,
            rentalIncome: "0.00",
            retainedDepositIncome: "0.00",
            totalIncome: "0.00",
          });

      const propertyIncomePromise = hasDateFilter
        ? reportRepository.getIncomeByProperty({
            from,
            to,
            order,
            page,
            pageSize: 10,
          })
        : Promise.resolve({
            data: [],
            totalIncome: "0.00",
            total: 0,
            page: 1,
            pageSize: 10,
            totalPages: 0,
          });

      [summary, propertyIncome] = await Promise.all([
        summaryPromise,
        propertyIncomePromise,
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
  }

  if (forbidden) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
        <Navbar />
        <main className="mx-auto flex flex-1 w-full max-w-[1200px] flex-col items-center justify-center px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Acceso denegado</h1>
          <p className="text-zinc-600 mb-6">
            {reportMessages.errors.forbidden}
          </p>
          <Link
            href="/"
            className="rounded-xl bg-[#1E4DB7] px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
          >
            Volver al inicio
          </Link>
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
        key={`${from ?? ""}_${to ?? ""}_${order}_${page}`}
        initialSummary={initialSummary}
        initialPropertyIncome={initialPropertyIncome}
        initialFrom={from ?? ""}
        initialTo={to ?? ""}
        initialOrder={order}
      />
    </div>
  );
}

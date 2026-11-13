import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { RatingsPageBody } from "@/components/reports/ratings-page-body";
import { profileRepository, reportRepository } from "@/lib/repositories";
import { ApiError } from "@/lib/api/client";
import { reportMessages } from "@/lib/messages/reports";
import type { PropertyRatingListResult } from "@/lib/repositories/report-repository";

export const metadata: Metadata = {
  title: "Reportes de calificaciones | Runaways",
  description: "Consulta la calificación promedio y el número de reseñas por bien.",
};

interface OwnerRatingsPageProps {
  searchParams?: Promise<{
    from?: string;
    to?: string;
    order?: string;
    page?: string;
    scenario?: string;
    bypass?: string;
    dev?: string;
  }>;
}

export default async function OwnerRatingsPage({
  searchParams,
}: OwnerRatingsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const from = resolvedParams.from || undefined;
  const to = resolvedParams.to || undefined;
  const order = resolvedParams.order === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number(resolvedParams.page) || 1);
  const scenario = resolvedParams.scenario || undefined;
  const bypass =
    resolvedParams.bypass === "true" ||
    resolvedParams.dev === "true" ||
    scenario === "owner";

  let forbidden = false;

  // Verificación de acceso para rol OWNER (se puede omitir en desarrollo con ?bypass=true o ?dev=true)
  if (!bypass) {
    try {
      const profile = await profileRepository.getUserProfile(scenario);
      if (!profile || profile.role !== "OWNER") {
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
  }

  let ratings: PropertyRatingListResult | null = null;

  if (!forbidden) {
    try {
      ratings = await reportRepository.getPropertyRatings({
        from,
        to,
        order,
        page,
        pageSize: 10,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          redirect("/login");
        }
        if (error.status === 403) {
          forbidden = true;
        }
      }
      console.error("Error al cargar calificaciones de los bienes:", error);
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

  const initialRatings: PropertyRatingListResult = ratings ?? {
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <Navbar />
      <RatingsPageBody
        initialRatings={initialRatings}
        initialFrom={from ?? ""}
        initialTo={to ?? ""}
        initialOrder={order}
      />
    </div>
  );
}

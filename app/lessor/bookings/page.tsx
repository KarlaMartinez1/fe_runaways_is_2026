import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui";
import { BookingStatusFilter } from "@/components/bookings/booking-status-filter";
import { Pagination } from "@/components/ui/pagination";
import { getCurrentUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { BookingListResult, BookingStatus, Property } from "@/lib/api/types";
import { formatShortRange } from "@/lib/bookings/format";
import { bookingMessages } from "@/lib/messages/bookings";
import { categoryLabels } from "@/lib/messages/properties";
import { bookingRepository, propertyRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "Reservas de mis bienes | Runaways" };

const STATUSES: BookingStatus[] = ["PENDIENTE", "PAGADA", "FINALIZADA", "CANCELADA"];
const statusLabel: Record<BookingStatus, string> = {
  PENDIENTE: "Pendiente", PAGADA: "Pagada", FINALIZADA: "Finalizada", CANCELADA: "Cancelada",
};
const statusVariant = {
  PENDIENTE: "warning",
  PAGADA: "info",
  FINALIZADA: "success",
  CANCELADA: "danger",
} as const;

type PageProps = { searchParams: Promise<{ status?: string; page?: string }> };

export default async function LessorBookingsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "OWNER") redirect("/access-denied");

  const params = await searchParams;
  const status = STATUSES.find((item) => item === params.status);
  const page = Math.max(1, Number(params.page) || 1);

  let result: BookingListResult | null = null;
  let properties: Property[] = [];
  let errorMessage: string | null = null;
  try {
    let propertyPage = await propertyRepository.listMine(1);
    properties = propertyPage.data;
    for (let current = 2; current <= propertyPage.totalPages; current++) {
      propertyPage = await propertyRepository.listMine(current);
      properties.push(...propertyPage.data);
    }

    // La paginación se resuelve en el endpoint OWNER, igual que el catálogo:
    // cada cambio de página solicita solo sus 10 reservas.
    result = await bookingRepository.listLessor({ page, status });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    errorMessage = error instanceof ApiError && error.status === 403
      ? bookingMessages.lessor.forbidden
      : bookingMessages.lessor.loadError;
    console.error("Error al cargar reservas del arrendador:", error);
  }

  const propertyById = new Map(properties.map((property) => [property.id, property]));
  const query: Record<string, string> = {};
  if (status) query.status = status;

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-5 py-10 sm:px-8 lg:px-16">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-3xl font-bold text-zinc-900">{bookingMessages.lessor.title}</h1>
          <BookingStatusFilter status={status} />
        </div>

        {errorMessage ? <p role="alert" className="text-zinc-700">{errorMessage}</p> : result && (
          <>
            {result.data.length === 0 ? <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-600">{bookingMessages.lessor.empty}</p> : (
              <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
                <table className="w-full min-w-[960px] border-collapse text-left text-sm">
                  <thead className="bg-zinc-50 text-zinc-500">
                    <tr>{["Bien", "Categoría", "Arrendatario", "Fechas", "Estado", "Acciones"].map((heading) => <th key={heading} scope="col" className="px-5 py-4 text-sm font-medium">{heading}</th>)}</tr>
                  </thead>
                  <tbody>
                    {result.data.map((booking) => {
                      const property = propertyById.get(booking.propertyId);
                      const bookingCategory = booking.propertyCategory ?? property?.category;
                      return (
                        <tr key={booking.id} className="border-t border-zinc-200 text-zinc-800">
                          <td className="px-5 py-4 font-medium">{booking.propertyTitle || property?.title || "—"}</td>
                          <td className="px-5 py-4">{bookingCategory ? categoryLabels[bookingCategory] : "—"}</td>
                          <td className="px-5 py-4">{booking.lesseeName || "—"}</td>
                          <td className="whitespace-nowrap px-5 py-4 text-zinc-600">{formatShortRange(booking.startDate, booking.endDate)}</td>
                          <td className="px-5 py-4"><Badge variant={statusVariant[booking.status]} size="sm">{statusLabel[booking.status]}</Badge></td>
                          <td className="px-5 py-3">
                            <button type="button" disabled title="La mensajería estará disponible cuando se defina la ruta del backend" className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-xl bg-blue-50 px-4 text-sm font-semibold text-[#1E4DB7] opacity-60">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                <path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-4 3v-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                                <path d="M8 9h8M8 12h5" />
                              </svg>
                              Mensaje
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {result.totalPages > 1 && <Pagination currentPage={result.page} totalPages={result.totalPages} basePath="/lessor/bookings" query={query} />}
          </>
        )}
      </main>
    </>
  );
}

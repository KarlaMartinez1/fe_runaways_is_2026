import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookingList } from "@/components/bookings/booking-list";
import { Navbar } from "@/components/layout/navbar";
import { Pagination } from "@/components/ui/pagination";
import { ApiError } from "@/lib/api/client";
import type { BookingListResult, BookingStatus } from "@/lib/api/types";
import { bookingMessages } from "@/lib/messages/bookings";
import { bookingRepository } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "Mis reservas | Runaways",
};

const STATUSES: BookingStatus[] = ["PENDIENTE", "PAGADA", "FINALIZADA", "CANCELADA"];

type MyBookingsPageProps = {
  searchParams: Promise<{ status?: string; page?: string; created?: string }>;
};

export default async function MyBookingsPage({ searchParams }: MyBookingsPageProps) {
  const params = await searchParams;
  const status = STATUSES.find((value) => value === params.status);
  const page = Math.max(1, Number(params.page) || 1);

  let result: BookingListResult | null = null;
  let errorMessage: string | null = null;

  try {
    result = await bookingRepository.listMine({ page, status });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }
    if (error instanceof ApiError && error.status === 403) {
      errorMessage = bookingMessages.mine.forbidden;
    } else {
      console.error("Error al cargar mis reservas:", error);
      errorMessage = bookingMessages.mine.loadError;
    }
  }

  const query: Record<string, string> = status ? { status: status } : {};

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1000px] flex-col gap-6 px-6 py-8 md:px-16">
        <h1 className="text-3xl font-bold text-zinc-900">{bookingMessages.mine.title}</h1>

        {params.created === "1" && (
          <p role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
            {bookingMessages.createdBanner}
          </p>
        )}

        <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
          <Link
            href="/bookings/mine"
            className={`rounded-full px-3 py-1 text-sm ${!status ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"}`}
          >
            {bookingMessages.mine.all}
          </Link>
          {STATUSES.map((value) => (
            <Link
              key={value}
              href={`/bookings/mine?status=${value}`}
              className={`rounded-full px-3 py-1 text-sm ${status === value ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"}`}
            >
              {value}
            </Link>
          ))}
        </nav>

        {errorMessage && (
          <p role="alert" className="text-zinc-700">
            {errorMessage}
          </p>
        )}

        {result && (
          <>
            <BookingList items={result.data} variant="mine" emptyMessage={bookingMessages.mine.empty} />
            {result.totalPages > 1 && (
              <Pagination
                currentPage={result.page}
                totalPages={result.totalPages}
                basePath="/bookings/mine"
                query={query}
              />
            )}
          </>
        )}
      </main>
    </>
  );
}
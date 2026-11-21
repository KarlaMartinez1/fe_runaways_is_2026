"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { bookingMessages } from "@/lib/messages/bookings";
import type { BookingStatus } from "@/lib/api/types";

const statuses: BookingStatus[] = ["PENDIENTE", "PAGADA", "FINALIZADA", "CANCELADA"];
const labels: Record<BookingStatus, string> = {
  PENDIENTE: "Pendiente",
  PAGADA: "Pagada",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
};

type Props = { status?: BookingStatus };

export function BookingStatusFilter({ status }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (value) params.set("status", value);
    else params.delete("status");
    const query = params.toString();
    router.push(query ? `/lessor/bookings?${query}` : "/lessor/bookings");
  }

  return (
    <label className="flex items-center gap-3 text-sm font-medium text-zinc-800">
      Estado
      <select
        name="status"
        value={status ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 min-w-44 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-normal text-zinc-900 outline-none transition-colors hover:border-[#2449c6] focus:border-[#2449c6] focus:ring-2 focus:ring-blue-100"
      >
        <option value="">{bookingMessages.mine.all}</option>
        {statuses.map((item) => <option key={item} value={item}>{labels[item]}</option>)}
      </select>
    </label>
  );
}

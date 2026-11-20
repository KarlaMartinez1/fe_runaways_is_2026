"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitRenterReviewAction } from "@/app/actions/renter-reviews";
import { Button, Card } from "@/components/ui";

export function RateRenterForm({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  function submit() {
    startTransition(async () => {
      const result = await submitRenterReviewAction(reservationId, rating, comment);
      if (result.ok) { router.push("/lessor/bookings"); return; }
      if (result.sessionExpired) { router.push("/login"); return; }
      setError(result.message);
    });
  }
  return <Card padding="md" className="flex flex-col gap-5">
    <div><p className="mb-2 text-sm font-semibold">Calificación del arrendatario</p><div className="flex gap-2" role="radiogroup" aria-label="Calificación del arrendatario">
      {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} de 5 estrellas`} onClick={() => setRating(value)} className={`text-3xl ${value <= rating ? "text-amber-500" : "text-zinc-300"}`}>★</button>)}
    </div></div>
    <label className="flex flex-col gap-2 text-sm font-semibold">Comentario (opcional)<textarea value={comment} maxLength={200} onChange={(event) => setComment(event.target.value)} rows={4} className="rounded-xl border border-zinc-300 p-3 font-normal"/><span className="text-right text-xs font-normal text-zinc-500">{comment.length}/200</span></label>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <Button onClick={submit} disabled={rating === 0 || pending} isLoading={pending}>Enviar reseña</Button>
  </Card>;
}

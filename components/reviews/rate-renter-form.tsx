"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitRenterReviewAction } from "@/app/actions/renter-reviews";
import { Button, Card } from "@/components/ui";
import { RoleChangeDialog } from "@/components/profile/role-change-dialog";
import { reviewMessages } from "@/lib/messages/reviews";
import { COMMENT_MAX_LENGTH } from "@/lib/reviews/rules";
import { cn } from "@/lib/utils/cn";
import { CharacterCounter } from "./character-counter";
import { StarRatingInput } from "./star-rating-input";

export function RateRenterForm({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [ratingError, setRatingError] = useState<string | undefined>();
  const [commentError, setCommentError] = useState<string | undefined>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const commentExceeded = comment.length > COMMENT_MAX_LENGTH;
  const commentTooShort = comment.trim().length < 10;
  const canSubmit = rating !== null && !commentTooShort && !commentExceeded && !isPending;

  function handleRequestSubmit() {
    const nextRatingError = rating === null ? reviewMessages.errors.renterRating : undefined;
    const nextCommentError = commentTooShort
      ? reviewMessages.errors.renterCommentMin
      : commentExceeded ? reviewMessages.errors.comment : undefined;
    setRatingError(nextRatingError);
    setCommentError(nextCommentError);
    setServerError(null);
    if (!nextRatingError && !nextCommentError) setIsConfirming(true);
  }

  function handleConfirm() {
    if (rating === null) return;
    startTransition(async () => {
      const result = await submitRenterReviewAction(reservationId, rating, comment.trim());
      if (result.ok) { router.push("/lessor/bookings"); return; }
      if (result.sessionExpired) { router.push("/login"); return; }
      setServerError(result.message);
      setIsConfirming(false);
    });
  }

  return (
    <Card padding="md" className="flex flex-col gap-6">
      <div className="flex flex-col gap-5">
        <StarRatingInput
          label={reviewMessages.renterRating}
          value={rating}
          onChange={setRating}
          error={ratingError}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="renter-review-comment" className="flex items-center gap-1 text-[13px] font-semibold text-[#1f2330]">
            {reviewMessages.renterComment}
            <span className="text-xs font-normal text-[#5b6270]">{reviewMessages.commentOptional}</span>
          </label>
          <textarea
            id="renter-review-comment"
            value={comment}
            onChange={(event) => { setComment(event.target.value); setCommentError(undefined); }}
            placeholder={reviewMessages.commentPlaceholder}
            rows={4}
            aria-invalid={Boolean(commentError) || commentExceeded}
            className={cn(
              "w-full resize-none rounded-[10px] border bg-white p-3 text-sm text-[#1f2330] outline-none placeholder:text-[#5b6270] focus:ring-2 focus:ring-blue-100",
              commentError || commentExceeded ? "border-red-500" : "border-[#cfd3da] focus:border-blue-600",
            )}
          />
          <div className="flex items-center justify-between gap-3">
            {commentError ? <p role="alert" className="text-xs font-medium text-red-600">{commentError}</p> : <span />}
            <CharacterCounter length={comment.length} max={COMMENT_MAX_LENGTH} />
          </div>
        </div>
      </div>

      {serverError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}

      {!isConfirming && (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleRequestSubmit} disabled={!canSubmit}>{reviewMessages.submit}</Button>
          <Link href="/lessor/bookings" className="inline-flex h-11 items-center justify-center rounded-xl border border-[#cfd3da] px-5 text-sm font-semibold text-[#1f2330] hover:bg-gray-50">Volver a Reservas de mis bienes</Link>
        </div>
      )}
      <RoleChangeDialog
        isOpen={isConfirming}
        fromRole="OWNER"
        toRole="TENANT"
        title="Confirmar calificación"
        body={reviewMessages.confirmMessage}
        badgeLabel="La calificación no se puede modificar después de enviarla"
        confirmLabel={isPending ? reviewMessages.submitting : reviewMessages.confirmAccept}
        cancelLabel={reviewMessages.confirmBack}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirming(false)}
        isLoading={isPending}
      />
    </Card>
  );
}

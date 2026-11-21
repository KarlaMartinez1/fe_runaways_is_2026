"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { submitPropertyReviewAction } from "@/app/actions/reviews";
import { Button, Card } from "@/components/ui";
import { reviewMessages } from "@/lib/messages/reviews";
import { COMMENT_MAX_LENGTH } from "@/lib/reviews/rules";
import { cn } from "@/lib/utils/cn";
import { CharacterCounter } from "./character-counter";
import { StarRatingInput } from "./star-rating-input";

type RatePropertyFormProps = {
  reservationId: string;
};

type FieldErrors = {
  propertyRating?: string;
  ownerRating?: string;
  comment?: string;
};

export function RatePropertyForm({ reservationId }: RatePropertyFormProps) {
  const router = useRouter();
  const [propertyRating, setPropertyRating] = useState<number | null>(null);
  const [ownerRating, setOwnerRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const commentExceeded = comment.length > COMMENT_MAX_LENGTH;
  // El documento pide deshabilitar el botón hasta elegir ambas puntuaciones.
  const canSubmit =
    propertyRating !== null && ownerRating !== null &&
    !commentExceeded && !isPending;

  useEffect(() => {
    if (!isConfirming || isPending) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsConfirming(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isConfirming, isPending]);

  function handleRequestSubmit() {
    const errors: FieldErrors = {};
    if (propertyRating === null) errors.propertyRating = reviewMessages.errors.propertyRating;
    if (ownerRating === null) errors.ownerRating = reviewMessages.errors.ownerRating;
    if (commentExceeded) errors.comment = reviewMessages.errors.comment;

    setFieldErrors(errors);
    setServerError(null);
    if (Object.keys(errors).length === 0) {
      setIsConfirming(true);
    }
  }

  function handleConfirm() {
    if (propertyRating === null || ownerRating === null) return;

    const payload = {
      reservationId,
      propertyRating,
      userRating: ownerRating,
      comment: comment.trim() || undefined,
    };

    setServerError(null);
    startTransition(async () => {
      const result = await submitPropertyReviewAction(payload);

      if (result.ok) {
        router.push("/bookings/mine?rated=1");
        return;
      }
      if (result.sessionExpired) {
        router.push("/login");
        return;
      }
      setServerError(result.message);
      setIsConfirming(false);
    });
  }

  return (
    <Card padding="sm" className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <StarRatingInput
          label={reviewMessages.ownerRating}
          value={ownerRating}
          onChange={setOwnerRating}
          error={fieldErrors.ownerRating}
        />

        <div className="flex flex-col gap-2">
          <StarRatingInput
            label={reviewMessages.propertyRating}
            value={propertyRating}
            onChange={setPropertyRating}
            error={fieldErrors.propertyRating}
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="property-review-comment" className="flex items-center gap-1 text-[13px] font-semibold text-[#1f2330]">
              {reviewMessages.propertyComment}
              <span className="text-xs font-normal text-[#5b6270]">{reviewMessages.commentOptional}</span>
            </label>
            <textarea
              id="property-review-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder={reviewMessages.commentPlaceholder}
              rows={3}
              aria-invalid={Boolean(fieldErrors.comment) || commentExceeded}
              className={cn(
                "w-full resize-none rounded-[10px] border bg-white p-2.5 text-sm text-[#1f2330] outline-none placeholder:text-[#5b6270] focus:ring-2 focus:ring-blue-100",
                fieldErrors.comment || commentExceeded
                  ? "border-red-500"
                  : "border-[#cfd3da] focus:border-blue-600",
              )}
            />
            <div className="flex items-center justify-between gap-3">
              {fieldErrors.comment ? (
                <p role="alert" className="text-xs font-medium text-red-600">
                  {fieldErrors.comment}
                </p>
              ) : (
                <span />
              )}
              <CharacterCounter length={comment.length} max={COMMENT_MAX_LENGTH} />
            </div>
          </div>
        </div>
      </div>

      {serverError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </p>
      )}

      {!isConfirming && (
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" onClick={handleRequestSubmit} disabled={!canSubmit}>
            {isPending ? reviewMessages.submitting : reviewMessages.submit}
          </Button>
          <Link
            href="/bookings/mine"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[#cfd3da] px-4 text-xs font-semibold text-[#1f2330] hover:bg-gray-50"
          >
            {reviewMessages.cancel}
          </Link>
        </div>
      )}

      {isConfirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px] animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-confirm-title"
          onClick={() => !isPending && setIsConfirming(false)}
        >
          <div
            className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5EEFC] text-xl font-bold text-[#1E4DB7]"
              aria-hidden="true"
            >
              ★
            </div>
            <h2 id="review-confirm-title" className="mt-4 text-lg font-bold tracking-tight text-gray-950 sm:text-xl">
              {reviewMessages.confirmTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {reviewMessages.confirmMessage}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirming(false)}
                disabled={isPending}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
              >
                {reviewMessages.confirmBack}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="rounded-xl bg-[#1E4DB7] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#163c91] disabled:opacity-50"
              >
                {isPending ? reviewMessages.submitting : reviewMessages.confirmAccept}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
    <Card padding="md" className="flex flex-col gap-6">
      <div className="flex flex-col gap-5">
        <StarRatingInput
          label={reviewMessages.propertyRating}
          value={propertyRating}
          onChange={setPropertyRating}
          error={fieldErrors.propertyRating}
        />

        <StarRatingInput
          label={reviewMessages.ownerRating}
          value={ownerRating}
          onChange={setOwnerRating}
          error={fieldErrors.ownerRating}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="property-review-comment" className="flex items-center gap-1 text-[13px] font-semibold text-[#1f2330]">
            {reviewMessages.propertyComment}
            <span className="text-xs font-normal text-[#5b6270]">{reviewMessages.commentOptional}</span>
          </label>
          <textarea
            id="property-review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder={reviewMessages.commentPlaceholder}
            rows={4}
            aria-invalid={Boolean(fieldErrors.comment) || commentExceeded}
            className={cn(
              "w-full resize-none rounded-[10px] border bg-white p-3 text-sm text-[#1f2330] outline-none placeholder:text-[#5b6270] focus:ring-2 focus:ring-blue-100",
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

      {serverError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </p>
      )}

      {isConfirming ? (
        <div
          role="alertdialog"
          aria-label={reviewMessages.confirmMessage}
          className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
        >
          <p className="text-sm text-[#1f2330]">{reviewMessages.confirmMessage}</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleConfirm} isLoading={isPending} disabled={isPending}>
              {isPending ? reviewMessages.submitting : reviewMessages.confirmAccept}
            </Button>
            <Button variant="outline" onClick={() => setIsConfirming(false)} disabled={isPending}>
              {reviewMessages.confirmBack}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleRequestSubmit} disabled={!canSubmit}>
            {isPending ? reviewMessages.submitting : reviewMessages.submit}
          </Button>
          <Link
            href="/bookings/mine"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#cfd3da] px-5 text-sm font-semibold text-[#1f2330] hover:bg-gray-50"
          >
            {reviewMessages.cancel}
          </Link>
        </div>
      )}
    </Card>
  );
}

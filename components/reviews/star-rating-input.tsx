"use client";

import { useId } from "react";
import { reviewMessages } from "@/lib/messages/reviews";
import { RATING_MAX, RATING_MIN } from "@/lib/reviews/rules";
import { cn } from "@/lib/utils/cn";

type StarRatingInputProps = {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  error?: string;
};

const STARS = Array.from({ length: RATING_MAX - RATING_MIN + 1 }, (_, index) => RATING_MIN + index);

export function StarRatingInput({ label, value, onChange, error }: StarRatingInputProps) {
  const labelId = useId();
  const errorId = `${labelId}-error`;

  return (
    <div className="flex flex-col gap-1">
      <span id={labelId} className="text-[13px] font-semibold text-[#1f2330]">
        {label}
      </span>

      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="flex gap-1"
      >
        {STARS.map((star) => {
          const filled = value !== null && star <= value;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={reviewMessages.stars(star)}
              onClick={() => onChange(star)}
              className={cn(
                "rounded text-[27px] leading-none transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:text-[29px]",
                filled ? "text-[#f5a623]" : "text-[#d1d5db]",
              )}
            >
              {filled ? "★" : "☆"}
            </button>
          );
        })}
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

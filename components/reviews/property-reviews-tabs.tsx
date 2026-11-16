import type { ReviewListItem } from "@/lib/api/types";
import { reviewMessages } from "@/lib/messages/reviews";

type PropertyReviewsTabsProps = {
  propertyReviews: ReviewListItem[];
};

function ReviewList({ items, emptyMessage }: { items: ReviewListItem[]; emptyMessage: string }) {
  if (items.length === 0) {
    return <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600">{emptyMessage}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((review) => (
        <li key={review.id} className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-semibold text-zinc-900">{review.reviewerName}</p>
            <time dateTime={review.createdAt} className="text-sm text-zinc-500">
              {new Date(review.createdAt).toLocaleDateString("es-SV", {
                year: "numeric",
                month: "short",
                day: "numeric",
                timeZone: "America/El_Salvador",
              })}
            </time>
          </div>
          <p className="mt-1 text-sm font-medium text-amber-600" aria-label={reviewMessages.stars(review.rating)}>
            <span aria-hidden="true">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
            <span className="ml-2 text-zinc-600">{review.rating}.0</span>
          </p>
          {review.comment && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{review.comment}</p>}
        </li>
      ))}
    </ul>
  );
}

export function PropertyReviewsTabs({ propertyReviews }: PropertyReviewsTabsProps) {
  return (
    <section aria-label={reviewMessages.propertyReviews} className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold text-zinc-900">
        {reviewMessages.propertyReviews} ({propertyReviews.length})
      </h2>
      <ReviewList items={propertyReviews} emptyMessage={reviewMessages.emptyPropertyReviews} />
    </section>
  );
}

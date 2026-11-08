"use client";

import { useState } from "react";
import { galleryMessages } from "@/lib/messages/properties";
import { cn } from "@/lib/utils/cn";

type PropertyGalleryProps = {
  images: string[];
  title: string;
};

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [current, setCurrent] = useState(0);
  const total = images.length;

  if (total === 0) {
    return <div className="aspect-[16/9] w-full rounded-2xl bg-[#D6DDF3]" aria-hidden="true" />;
  }

  const goTo = (index: number) => setCurrent((index + total) % total);

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#D6DDF3]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[current]}
        alt={galleryMessages.photoAlt(title, current + 1, total)}
        className="h-full w-full object-cover"
      />

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(current - 1)}
            aria-label={galleryMessages.previous}
            className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-800 shadow-sm hover:bg-zinc-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => goTo(current + 1)}
            aria-label={galleryMessages.next}
            className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-800 shadow-sm hover:bg-zinc-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={galleryMessages.goTo(index + 1)}
                aria-current={index === current}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === current ? "w-5 bg-[#2449c6]" : "w-1.5 bg-white/90",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
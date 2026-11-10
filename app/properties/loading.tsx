import { Navbar } from "@/components/layout/navbar";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main
        aria-busy="true"
        className="mx-auto flex w-full max-w-[1320px] flex-col gap-8 px-6 py-12 md:px-16"
      >
        <div className="h-[92px] w-full animate-pulse rounded-2xl bg-zinc-200" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-8">
          {Array.from({ length: 12 }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
            >
              <div className="h-[170px] w-full animate-pulse bg-zinc-200" />
              <div className="flex flex-col gap-2 p-4">
                <div className="h-4 w-16 animate-pulse rounded bg-zinc-200" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200" />
                <div className="h-5 w-1/3 animate-pulse rounded bg-zinc-200" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
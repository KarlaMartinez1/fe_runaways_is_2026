import { Navbar } from "@/components/layout/navbar";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main
        aria-busy="true"
        className="mx-auto flex w-full max-w-[1320px] flex-col gap-8 px-6 py-8 md:px-16"
      >
        <div className="h-4 w-36 animate-pulse rounded bg-zinc-200" />
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <div className="flex flex-1 flex-col gap-5">
            <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-zinc-200" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-200" />
            <div className="h-16 w-full animate-pulse rounded bg-zinc-200" />
          </div>
          <div className="h-72 w-full animate-pulse rounded-2xl bg-zinc-200 lg:w-[400px]" />
        </div>
      </main>
    </>
  );
}
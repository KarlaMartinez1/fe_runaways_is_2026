import { Navbar } from "@/components/layout/navbar";

export default function RatePropertyLoading() {
  return (
    <>
      <Navbar />
      <main
        aria-busy="true"
        aria-label="Cargando calificación"
        className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-8 sm:px-6 md:px-10 lg:px-16"
      >
        <div className="h-8 w-72 max-w-full animate-pulse rounded-lg bg-zinc-200" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-zinc-200" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[5fr_6fr]">
          <div className="h-[420px] animate-pulse rounded-2xl bg-zinc-100" />
          <div className="h-[420px] animate-pulse rounded-2xl bg-zinc-100" />
        </div>
      </main>
    </>
  );
}
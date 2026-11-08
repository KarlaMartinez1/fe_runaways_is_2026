import Link from "next/link";
import { paginationMessages } from "@/lib/messages/common";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string>;
};

function pageHref(basePath: string, page: number, query: Record<string, string> = {}) {
  const params = new URLSearchParams({ ...query, page: String(page) });
  return `${basePath}?${params.toString()}`;
}

const baseButton = "rounded-lg px-4 py-2 text-sm font-medium";
const enabledButton = `${baseButton} bg-zinc-200 text-zinc-900 hover:bg-zinc-300`;
const disabledButton = `${baseButton} cursor-not-allowed bg-zinc-100 text-zinc-400`;

export function Pagination({ currentPage, totalPages, basePath, query }: PaginationProps) {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav aria-label="Paginación" className="flex items-center justify-end gap-3">
      {hasPrevious ? (
        <Link href={pageHref(basePath, currentPage - 1, query)} className={enabledButton}>
          {paginationMessages.previous}
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledButton}>
          {paginationMessages.previous}
        </span>
      )}

      <span className="text-sm text-zinc-600">
        {paginationMessages.pageOf(currentPage, totalPages)}
      </span>

      {hasNext ? (
        <Link href={pageHref(basePath, currentPage + 1, query)} className={enabledButton}>
          {paginationMessages.next}
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledButton}>
          {paginationMessages.next}
        </span>
      )}
    </nav>
  );
}
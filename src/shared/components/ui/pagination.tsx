import { cn } from "@/shared/utils/cn";

type PageNumber = number | "...";

function buildPageNumbers(page: number, totalPages: number): PageNumber[] {
  if (totalPages <= 1) return [1];

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return pages.reduce<PageNumber[]>((acc, p, i, arr) => {
    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
    acc.push(p);
    return acc;
  }, []);
}

export interface PaginationProps {
  page: number;
  totalPages: number;
  hasNextPage?: boolean;
  onPageChange: (page: number) => void;
  label?: string;
  className?: string;
  pageSizeValue?: number;
  onPageSizeChange?: (limit: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  page,
  totalPages,
  hasNextPage,
  onPageChange,
  label,
  className,
  pageSizeValue,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const pageNumbers = buildPageNumbers(page, safeTotalPages);
  const isFirst = page <= 1;
  const isLast = page >= safeTotalPages;
  const nextDisabled = typeof hasNextPage === "boolean" ? !hasNextPage : isLast;

  return (
    <div className={cn("flex items-center justify-between text-sm text-text-muted px-4 sm:px-6 py-4 border-t border-border/50", className)}>
      <span>{label ?? ""}</span>
      <div className="flex items-center gap-3">
        {typeof pageSizeValue === "number" && typeof onPageSizeChange === "function" && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">Mostrar</span>
            <select
              value={pageSizeValue}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1.5 text-sm rounded-lg border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="text-sm text-text-muted">filas</span>
          </div>
        )}
        <button
          onClick={() => onPageChange(1)}
          disabled={isFirst}
          className={cn(
            "px-2 py-1.5 rounded-lg border transition-all",
            isFirst ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary",
          )}
        >
          «
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={isFirst}
          className={cn(
            "px-3 py-1.5 rounded-lg border transition-all",
            isFirst ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary",
          )}
        >
          Anterior
        </button>
        {pageNumbers.map((p, i) =>
          p === "..." ? (
            <span key={`e-${i}`} className="px-1">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                "w-9 h-9 rounded-lg border text-sm transition-all",
                p === page ? "bg-primary text-white border-primary" : "border-border hover:border-primary/50 hover:text-primary",
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={nextDisabled}
          className={cn(
            "px-3 py-1.5 rounded-lg border transition-all",
            nextDisabled ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary",
          )}
        >
          Siguiente
        </button>
        <button
          onClick={() => onPageChange(safeTotalPages)}
          disabled={isLast}
          className={cn(
            "px-2 py-1.5 rounded-lg border transition-all",
            isLast ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary",
          )}
        >
          »
        </button>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import { MdSearch } from "react-icons/md";
import { cn } from "@/shared/utils/cn";

export interface CrudToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  pageSizeValue?: number;
  onPageSizeChange?: (value: number) => void;
  pageSizeOptions?: number[];
  pageSizeLabel?: string;
  pageSizeSuffix?: string;

  filters?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function CrudToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  pageSizeValue,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  pageSizeLabel = "Mostrar",
  pageSizeSuffix = "filas",
  filters,
  className,
  children,
}: CrudToolbarProps) {
  const showSearch = typeof searchValue === "string" && typeof onSearchChange === "function";
  const showPageSize =
    typeof pageSizeValue === "number" &&
    typeof onPageSizeChange === "function" &&
    Array.isArray(pageSizeOptions) &&
    pageSizeOptions.length > 0;

  return (
    <div
      className={cn(
        "px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center",
        className
      )}
    >
      {showSearch && (
        <div className="relative flex-1 min-w-[240px]">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={cn(
              "w-full pl-9 pr-4 py-2.5 text-base rounded-xl border border-border bg-bg-card text-text-primary",
              "placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            )}
          />
        </div>
      )}

      {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
      {children}

      {showPageSize && (
        <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
          <span className="text-sm text-text-muted hidden sm:block">{pageSizeLabel}</span>
          <select
            value={pageSizeValue}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={cn(
              "text-base rounded-xl border border-border bg-bg-card text-text-primary px-2 py-2.5",
              "focus:outline-none focus:ring-2 focus:ring-primary/30"
            )}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="text-sm text-text-muted hidden sm:block">{pageSizeSuffix}</span>
        </div>
      )}
    </div>
  );
}


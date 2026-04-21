import type { ReactNode } from "react";
import { MdSearch } from "react-icons/md";
import { cn } from "@/shared/utils/cn";
import { Spinner } from "./spinner";

export interface CrudToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searching?: boolean;

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
  searching = false,
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
    <div className={cn("px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center", className)}>
      {showSearch && (
        <div className="relative flex-1 min-w-[240px]">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={cn(
              "w-full pl-9 pr-10 py-2.5 text-base rounded-xl border border-border bg-bg-card text-text-primary",
              "placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all",
              searching && "border-accent-primary/50",
            )}
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner size="sm" className="text-accent-primary" />
            </div>
          )}
          {searchValue && searchValue.length > 0 && searchValue.length < 2 && !searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="text-xs text-text-muted bg-bg-secondary px-2 py-0.5 rounded-full whitespace-nowrap">
                Mín. 2 caracteres
              </span>
            </div>
          )}
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
              "focus:outline-none focus:ring-2 focus:ring-primary/30",
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

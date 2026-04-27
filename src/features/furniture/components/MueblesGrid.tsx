import type { Mueble, PaginationMeta, MuebleCondition } from "@/features/furniture/types";
import type { CategoriaMueble } from "@/features/furniture-categories/types";
import { MdClose, MdChair, MdSearch } from "react-icons/md";
import { cn } from "@/shared/utils/cn";
import { Pagination, EmptyState, CheckboxDropdown } from "@/components";
import { MuebleCard } from "./MuebleCard";
import { muebleConditionLabels } from "../types";
import { Spinner } from "@/shared/components/ui/spinner";

interface Props {
  muebles: Mueble[];
  categorias: CategoriaMueble[];
  pagination: PaginationMeta;
  limit: number;
  filters: { codigo?: string; categoria?: string; condicion?: MuebleCondition };
  searchInput: string;
  loading?: boolean;
  searching?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSearch: (q: string) => void;
  onCategoriaChange: (catId: string | null) => void;
  onCondicionChange: (cond: MuebleCondition | null) => void;
  onClearFilters: () => void;
  onEdit: (mueble: Mueble) => void;
  onDelete: (mueble: Mueble) => void;
  onViewImage: (mueble: Mueble) => void;
  getRoomNro: (id: string | null) => string | undefined;
}

const conditionKeys: MuebleCondition[] = ["BUENO", "REGULAR", "DANADO", "FALTANTE"];

export function MueblesGrid({
  muebles,
  categorias,
  pagination,
  limit,
  filters,
  searchInput,
  loading = false,
  searching = false,
  onPageChange,
  onLimitChange,
  onSearch,
  onCategoriaChange,
  onCondicionChange,
  onClearFilters,
  onEdit,
  onDelete,
  onViewImage,
  getRoomNro,
}: Props) {
  const { page, totalPages, total } = pagination;

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const hasActiveFilters = searchInput.trim() !== "" || filters.codigo || filters.categoria || filters.condicion;

  const categoriaOptions = categorias.map((cat) => ({
    value: cat.id,
    label: cat.nombre,
  }));

  const condicionOptions = conditionKeys.map((key) => ({
    value: key,
    label: muebleConditionLabels[key],
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-50 max-w-75">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Código..."
            className={cn(
              "w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-border bg-bg-card text-text-primary",
              "placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all",
              searching && "border-accent-primary/50",
            )}
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner size="sm" className="text-accent-primary" />
            </div>
          )}
        </div>

        <CheckboxDropdown label="Categoría" options={categoriaOptions} selected={filters.categoria ?? null} onChange={onCategoriaChange} />
        <CheckboxDropdown<MuebleCondition>
          label="Condición"
          options={condicionOptions}
          selected={filters.condicion ?? null}
          onChange={onCondicionChange}
        />

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-all"
          >
            <MdClose className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-text-muted">Cargando muebles...</div>
        </div>
      ) : muebles.length === 0 ? (
        <EmptyState
          icon={<MdChair className="w-10 h-10 text-text-muted/50" />}
          title={hasActiveFilters ? "Sin resultados" : "Sin muebles"}
          description={hasActiveFilters ? "No se encontraron muebles con los filtros seleccionados" : "Comienza agregando tu primer mueble"}
          action={
            hasActiveFilters ? (
              <button
                onClick={onClearFilters}
                className="text-sm px-4 py-2 rounded-xl border border-border text-text-muted hover:text-text-primary transition-all"
              >
                Limpiar filtros
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="max-h-[calc(120dvh-420px)] overflow-y-auto scrollbar-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {muebles.map((mueble) => (
              <MuebleCard
                key={mueble.id}
                mueble={mueble}
                onEdit={(e) => {
                  e.stopPropagation();
                  onEdit(mueble);
                }}
                onDelete={(e) => {
                  e.stopPropagation();
                  onDelete(mueble);
                }}
                onViewImage={() => onViewImage(mueble)}
                habitacionNro={getRoomNro(mueble.habitacion_id)}
              />
            ))}
          </div>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        hasNextPage={pagination.hasNextPage}
        onPageChange={onPageChange}
        label={total === 0 ? "Sin resultados" : `${from}–${to} de ${total} mueble${total !== 1 ? "s" : ""}`}
        pageSizeValue={limit}
        onPageSizeChange={onLimitChange}
        pageSizeOptions={[5, 10, 25, 50]}
        className="px-0"
      />
    </div>
  );
}

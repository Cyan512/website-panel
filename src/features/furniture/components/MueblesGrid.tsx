import type { Mueble, PaginationMeta, MuebleCondition } from "@/features/furniture/types";
import type { CategoriaMueble } from "@/features/furniture-categories/types";
import { MdClose, MdChair } from "react-icons/md";
import { cn } from "@/shared/utils/cn";
import { CrudToolbar, Pagination, EmptyState } from "@/components";
import { MuebleCard } from "./MuebleCard";
import { muebleConditionLabels, muebleConditionColors } from "../types";

interface Props {
  muebles: Mueble[];
  categorias: CategoriaMueble[];
  pagination: PaginationMeta;
  limit: number;
  filters: { nombre?: string; categoria?: string; condicion?: MuebleCondition };
  searchInput: string;
  loading?: boolean;
  searching?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSearch: (q: string) => void;
  onCategoriaChange: (catId: string | null) => void;
  onCondicionChange: (cond: MuebleCondition | null) => void;
  onClearFilters: () => void;
  onRowClick: (mueble: Mueble) => void;
  onEdit: (mueble: Mueble) => void;
  onDelete: (mueble: Mueble) => void;
  getCategoryName: (mueble: Mueble) => string | undefined;
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
  onRowClick,
  onEdit,
  onDelete,
  getCategoryName,
  getRoomNro,
}: Props) {
  const { page, totalPages, total } = pagination;

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const hasActiveFilters = searchInput.trim() !== "" || filters.categoria || filters.condicion;

  return (
    <div className="space-y-4">
      {/* Toolbar con búsqueda */}
      <CrudToolbar
        searchValue={searchInput}
        onSearchChange={onSearch}
        searchPlaceholder="Buscar por nombre..."
        searching={searching}
        pageSizeValue={limit}
        onPageSizeChange={onLimitChange}
        pageSizeOptions={[12, 24, 48]}
      />

      {/* Filtros de categoría y condición */}
      <div className="flex flex-wrap items-start gap-4">
        {/* Filtro de categoría */}
        <div className="space-y-1.5">
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Categoría</p>
          <div className="flex flex-wrap gap-1.5">
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoriaChange(filters.categoria === cat.id ? null : cat.id)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border transition-all",
                  filters.categoria === cat.id
                    ? "bg-accent-primary text-white border-accent-primary"
                    : "border-border text-text-muted hover:border-accent-primary/50 hover:text-text-primary",
                )}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px self-stretch bg-border-light/50 min-h-[40px]" />

        {/* Filtro de condición */}
        <div className="space-y-1.5">
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Condición</p>
          <div className="flex flex-wrap gap-1.5">
            {conditionKeys.map((key) => (
              <button
                key={key}
                onClick={() => onCondicionChange(filters.condicion === key ? null : key)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border transition-all",
                  filters.condicion === key
                    ? "bg-accent-primary text-white border-accent-primary"
                    : "border-border text-text-muted hover:border-accent-primary/50 hover:text-text-primary",
                )}
              >
                {muebleConditionLabels[key]}
              </button>
            ))}
          </div>
        </div>

        {/* Limpiar filtros */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="self-end text-xs px-3 py-1.5 rounded-full border border-danger/30 text-danger hover:bg-danger/10 transition-all flex items-center gap-1"
          >
            <MdClose className="w-3 h-3" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-gradient-to-br from-accent-primary/10 to-accent-light/10 rounded-xl p-3 border border-accent-primary/20">
          <p className="text-text-muted text-xs">Total</p>
          <p className="text-xl font-bold font-display mt-0.5">{total}</p>
        </div>
        {conditionKeys.map((c) => (
          <div
            key={c}
            className="bg-gradient-to-br from-paper-medium/20 to-paper-medium/10 rounded-xl p-3 border border-border-light/50"
          >
            <p className="text-text-muted text-xs">{muebleConditionLabels[c]}</p>
            <p className="text-xl font-bold font-display mt-0.5">{muebles.filter((m) => m.condicion === c).length}</p>
          </div>
        ))}
      </div>

      {/* Grid de cards o estado vacío */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-text-muted">Cargando muebles...</div>
        </div>
      ) : muebles.length === 0 ? (
        <EmptyState
          icon={<MdChair className="w-10 h-10 text-text-muted/50" />}
          title={hasActiveFilters ? "Sin resultados" : "Sin muebles"}
          description={
            hasActiveFilters
              ? "No se encontraron muebles con los filtros seleccionados"
              : "Comienza agregando tu primer mueble"
          }
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {muebles.map((mueble) => (
            <MuebleCard
              key={mueble.id}
              mueble={mueble}
              onClick={() => onRowClick(mueble)}
              onEdit={(e) => {
                e.stopPropagation();
                onEdit(mueble);
              }}
              onDelete={(e) => {
                e.stopPropagation();
                onDelete(mueble);
              }}
              categoriaNombre={getCategoryName(mueble)}
              habitacionNro={getRoomNro(mueble.habitacion_id)}
            />
          ))}
        </div>
      )}

      {/* Leyenda de condiciones */}
      {muebles.length > 0 && (
        <div className="flex gap-4 flex-wrap text-xs text-text-muted">
          {conditionKeys.map((key) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={cn("w-2.5 h-2.5 rounded-full", muebleConditionColors[key].split(" ")[0])} />
              <span>{muebleConditionLabels[key]}</span>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        hasNextPage={pagination.hasNextPage}
        onPageChange={onPageChange}
        label={total === 0 ? "Sin resultados" : `${from}–${to} de ${total} mueble${total !== 1 ? "s" : ""}`}
        className="px-1"
      />
    </div>
  );
}

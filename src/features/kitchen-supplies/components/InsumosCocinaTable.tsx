import { Pagination } from "@/components";
import { cn } from "@/shared/utils/cn";
import type { InsumoCocina } from "../types";
import { MdEdit, MdDelete, MdSearch, MdSwapVert } from "react-icons/md";

function stockBadge(actual: number, minimo: number) {
  if (actual <= 0) return "bg-danger-bg text-danger";
  if (actual <= minimo) return "bg-warning-bg text-warning";
  return "bg-success-bg text-success";
}

interface Props {
  insumos: InsumoCocina[];
  isAdmin: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  totalPages: number;
  onEdit: (insumo: InsumoCocina) => void;
  onDelete: (insumo: InsumoCocina) => void;
  onMovimiento: (insumo: InsumoCocina) => void;
  deleting: boolean;
}

export function InsumosCocinaTable({
  insumos,
  isAdmin,
  search,
  onSearchChange,
  page,
  onPageChange,
  limit,
  onLimitChange,
  totalPages,
  onEdit,
  onDelete,
  onMovimiento,
  deleting,
}: Props) {
  const from = insumos.length === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, insumos.length);

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filter Row */}
      <div className="flex gap-2 items-center mb-4">
        <div className="relative flex-1 max-w-xs">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onPageChange(1);
            }}
            placeholder="Buscar..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

      </div>

      {/* Table with scroll */}
      <div className="max-h-[calc(120dvh-420px)] overflow-y-auto scrollbar-custom">
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto scrollbar-custom">
            <div className="overflow-x-auto px-4 sm:px-6">
              <table className="w-full text-base">
                <thead className="sticky top-0 bg-bg-primary z-10">
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide">
                      Código
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide">
                      Nombre
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">
                      Unidad
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide">
                      Stock
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">
                      Mínimo
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">
                      Estado
                    </th>
                    <th className="py-3 px-2 text-right text-sm font-semibold text-text-muted uppercase tracking-wide">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {insumos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-text-muted">
                        Sin resultados
                      </td>
                    </tr>
                  ) : (
                    insumos.map((i) => (
                      <tr
                        key={i.id}
                        className="border-b border-border/50 last:border-0 hover:bg-accent-primary/5 transition-colors"
                      >
                        <td className="py-3 px-2 text-sm font-mono text-text-muted">{i.codigo}</td>
                        <td className="py-3 px-2 font-medium text-text-primary">{i.nombre}</td>
                        <td className="py-3 px-2 text-text-muted text-sm hidden sm:table-cell">{i.unidad}</td>
                        <td className="py-3 px-2 text-right">
                          <span
                            className={cn(
                              "text-sm font-medium px-2 py-0.5 rounded-full",
                              stockBadge(i.stock_actual, i.stock_minimo)
                            )}
                          >
                            {i.stock_actual}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right text-text-muted text-sm hidden md:table-cell">
                          {i.stock_minimo}
                        </td>
                        <td className="py-3 px-2 text-center hidden sm:table-cell">
                          <span
                            className={cn(
                              "text-xs font-medium px-2 py-0.5 rounded-full",
                              i.activo ? "bg-success-bg text-success" : "bg-bg-tertiary text-text-muted"
                            )}
                          >
                            {i.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-1">
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => onMovimiento(i)}
                                  title="Registrar movimiento"
                                  className="p-1.5 rounded-lg text-text-muted hover:text-accent-primary hover:bg-accent-primary/10 transition-all"
                                >
                                  <MdSwapVert className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => onEdit(i)}
                                  title="Editar"
                                  className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
                                >
                                  <MdEdit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => onDelete(i)}
                                  disabled={deleting}
                                  title="Eliminar"
                                  className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all disabled:opacity-40"
                                >
                                  <MdDelete className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        pageSizeValue={limit}
        onPageSizeChange={(v) => { onLimitChange(v); onPageChange(1); }}
        pageSizeOptions={[5, 10, 25, 50]}
        onPageChange={onPageChange}
        label={
          insumos.length === 0
            ? "Sin resultados"
            : `${from}–${to} de ${insumos.length} insumo${insumos.length !== 1 ? "s" : ""}`
        }
      />
    </div>
  );
}

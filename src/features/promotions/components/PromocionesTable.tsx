import { cn } from "@/shared/utils/cn";
import type { Promocion } from "../types";
import { formatUTCDate } from "@/shared/utils/format";
import { MdEdit, MdDelete, MdSearch } from "react-icons/md";
import { Pagination } from "@/components";

interface Props {
  promociones: Promocion[];
  isAdmin: boolean;
  search: string;
  onSearchChange: (q: string) => void;
  page: number;
  totalPages: number;
  limit: number;
  total: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onEdit: (p: Promocion) => void;
  onDelete: (p: Promocion) => void;
  deleting?: boolean;
}

function isVigente(p: Promocion): boolean {
  const now = new Date();
  return p.estado && new Date(p.vig_desde) <= now && new Date(p.vig_hasta) >= now;
}

export function PromocionesTable({
  promociones,
  isAdmin,
  search,
  onSearchChange,
  page,
  totalPages,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
  deleting = false,
}: Props) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      {/* Search and Filter Row */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1 max-w-xs">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Table with scroll */}
      <div className="max-h-[calc(120dvh-420px)] overflow-y-auto scrollbar-custom">
        <table className="w-full text-base">
          <thead className="sticky top-0 bg-bg-primary z-10">
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide">Código</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">Tipo</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide">Valor</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Vigencia</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">Estado</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide hidden lg:table-cell">Habitaciones</th>
              <th className="py-3 px-2 text-right text-sm font-semibold text-text-muted uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {promociones.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-text-muted">Sin resultados</td>
              </tr>
            ) : (
              promociones.map((p) => {
                const vigente = isVigente(p);
                return (
                  <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-accent-primary/5 transition-colors">
                    <td className="py-3 px-2 font-mono text-sm font-semibold text-text-primary">{p.codigo}</td>
                    <td className="py-3 px-2 text-sm text-text-muted hidden sm:table-cell">
                      {p.tipo_descuento === "PORCENTAJE" ? "Porcentaje" : "Monto fijo"}
                    </td>
                    <td className="py-3 px-2 text-right font-semibold text-text-primary">
                      {p.tipo_descuento === "PORCENTAJE"
                        ? `${p.valor_descuento}%`
                        : `S/ ${p.valor_descuento.toFixed(2)}`}
                    </td>
                    <td className="py-3 px-2 text-sm text-text-muted hidden md:table-cell">
                      {formatUTCDate(p.vig_desde)}
                      {" → "}
                      {formatUTCDate(p.vig_hasta)}
                    </td>
                    <td className="py-3 px-2 text-center hidden sm:table-cell">
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          vigente
                            ? "bg-success-bg text-success"
                            : p.estado
                            ? "bg-warning-bg text-warning"
                            : "bg-bg-tertiary text-text-muted"
                        )}
                      >
                        {vigente ? "Vigente" : p.estado ? "Inactiva" : "Desactivada"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-xs text-text-muted hidden lg:table-cell">
                      {p.habitaciones.length > 0 ? p.habitaciones.length : "—"}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-end gap-1">
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => onEdit(p)}
                              title="Editar"
                              className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
                            >
                              <MdEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDelete(p)}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        pageSizeValue={limit}
        onPageSizeChange={onLimitChange}
        pageSizeOptions={[5, 10, 25, 50]}
        onPageChange={onPageChange}
        label={total === 0 ? "Sin resultados" : `${from}–${to} de ${total} promoción${total !== 1 ? "es" : ""}`}
      />
    </div>
  );
}

import { Pagination } from "@/components";
import { cn } from "@/shared/utils/cn";
import { estadoPagoLabels, metodoPagoLabels } from "../types";
import type { Pago, EstadoPago } from "../types";
import { MdEdit, MdDelete, MdSearch } from "react-icons/md";
import { formatUTCDate } from "@/shared/utils/format";

const estadoColors: Record<string, string> = {
  CONFIRMADO: "bg-success-bg text-success",
  DEVUELTO: "bg-warning-bg text-warning",
  RETENIDO: "bg-warning-bg text-warning",
  ANULADO: "bg-danger-bg text-danger",
};

interface Props {
  pagos: Pago[];
  isAdmin: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  filterEstado: EstadoPago | "";
  onFilterEstadoChange: (estado: EstadoPago | "") => void;
  page: number;
  onPageChange: (page: number) => void;
  perPage: number;
  onPerPageChange: (perPage: number) => void;
  onRowClick: (pago: Pago) => void;
  onEdit: (pago: Pago) => void;
  onDelete: (pago: Pago) => void;
  deleting: boolean;
}

export function PagosTable({
  pagos,
  isAdmin,
  search,
  onSearchChange,
  filterEstado,
  onFilterEstadoChange,
  page,
  onPageChange,
  perPage,
  onPerPageChange,
  onRowClick,
  onEdit,
  onDelete,
  deleting,
}: Props) {
  // Filtrado local
  const filtered = pagos.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.concepto.toLowerCase().includes(q) || p.metodo.toLowerCase().includes(q) || p.monto.includes(q);
    const matchEstado = !filterEstado || p.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const from = filtered.length === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, filtered.length);

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

        {/* Estado Filter Dropdown */}
        <select
          value={filterEstado}
          onChange={(e) => {
            onFilterEstadoChange(e.target.value as EstadoPago | "");
            onPageChange(1);
          }}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Todos los estados</option>
          {(Object.keys(estadoPagoLabels) as EstadoPago[]).map((k) => (
            <option key={k} value={k}>
              {estadoPagoLabels[k]}
            </option>
          ))}
        </select>
      </div>

      {/* Table with scroll */}
      <div className="max-h-[calc(100dvh-420px)] overflow-y-auto scrollbar-custom">
        <div className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-custom">
            <div className="overflow-x-auto px-4 sm:px-6">
                <table className="w-full text-base">
                <thead className="sticky top-0 bg-bg-primary z-10">
                    <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide">
                        Fecha
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide">
                        Concepto
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">
                        Método
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">
                        Recibido por
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide">
                        Monto
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide">
                        Estado
                    </th>
                    <th className="py-3 px-2 text-right text-sm font-semibold text-text-muted uppercase tracking-wide">
                        Acciones
                    </th>
                    </tr>
                </thead>
                <tbody>
                    {paginated.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="text-center py-10 text-text-muted">
                        Sin resultados
                        </td>
                    </tr>
                    ) : (
                    paginated.map((p) => (
                        <tr
                        key={p.id}
                        onClick={() => onRowClick(p)}
                        className="border-b border-border/50 last:border-0 hover:bg-accent-primary/5 cursor-pointer transition-colors"
                        >
                        <td className="py-3 px-2 text-text-muted text-sm">{formatUTCDate(p.fecha_pago)}</td>
                        <td className="py-3 px-2">
                            <p className="font-medium text-text-primary text-sm">{p.concepto}</p>
                        </td>
                        <td className="py-3 px-2 text-text-muted hidden sm:table-cell text-sm">
                            {metodoPagoLabels[p.metodo] ?? p.metodo}
                        </td>
                        <td className="py-3 px-2 text-text-muted hidden md:table-cell text-sm">
                            {p.recibido_por?.name ?? "—"}
                        </td>
                        <td className="py-3 px-2 text-right font-semibold text-text-primary">
                            {p.moneda} {parseFloat(p.monto).toFixed(2)}
                        </td>
                        <td className="py-3 px-2">
                            <span
                            className={cn(
                                "text-sm font-medium px-2 py-0.5 rounded-full",
                                estadoColors[p.estado] ?? "bg-bg-tertiary text-text-muted"
                            )}
                            >
                            {estadoPagoLabels[p.estado]}
                            </span>
                        </td>
                        <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
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
        pageSizeValue={perPage}
          onPageSizeChange={(v) => {
            onPerPageChange(v);
            onPageChange(1);
          }}
        pageSizeOptions={[5, 10, 25, 50]}
        onPageChange={onPageChange}
        label={
          filtered.length === 0
            ? "Sin resultados"
            : `${from}–${to} de ${filtered.length} pago${filtered.length !== 1 ? "s" : ""}`
        }
      />
    </div>
  );
}

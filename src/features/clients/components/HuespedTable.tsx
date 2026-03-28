import type { Huesped, PaginationMeta } from "../types";
import { MdSearch, MdEmail, MdPhone, MdEdit, MdDelete } from "react-icons/md";
import { cn } from "@/utils/cn";
import { useState } from "react";

interface Props {
  huespedes: Huesped[];
  pagination: PaginationMeta;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSearch: (q: string) => void;
  search: string;
  onRowClick: (huesped: Huesped) => void;
  onEdit: (huesped: Huesped) => void;
  onDelete: (huesped: Huesped) => void;
  onDeleteMany: (ids: string[]) => void;
}

export function HuespedTable({
  huespedes, pagination, limit, onPageChange, onLimitChange, onSearch, search,
  onRowClick, onEdit, onDelete, onDeleteMany,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { page, totalPages, total } = pagination;
  const pageIds = huespedes.map((h) => h.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  const toggleAll = () => {
    setSelected((prev) => {
      const s = new Set(prev);
      allPageSelected ? pageIds.forEach((id) => s.delete(id)) : pageIds.forEach((id) => s.add(id));
      return s;
    });
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const handleDeleteMany = () => {
    onDeleteMany(Array.from(selected));
    setSelected(new Set());
  };

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar por nombre, email, documento..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-text-muted hidden sm:block">Mostrar</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="text-sm rounded-xl border border-border bg-bg-card text-text-primary px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="text-xs text-text-muted hidden sm:block">filas</span>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5">
          <span className="text-sm font-medium text-primary">{selected.size} seleccionado{selected.size !== 1 ? "s" : ""}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setSelected(new Set())} className="text-xs px-3 py-1.5 rounded-lg border border-border text-text-muted hover:text-text-primary transition-all">Cancelar</button>
            <button onClick={handleDeleteMany} className="text-xs px-3 py-1.5 rounded-lg bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-all flex items-center gap-1.5">
              <MdDelete className="w-3.5 h-3.5" /> Eliminar seleccionados
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-paper-medium/20 border-b border-border">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allPageSelected} onChange={toggleAll} className="w-4 h-4 accent-primary rounded cursor-pointer" />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Huésped</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">Documento</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden lg:table-cell">Teléfono</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden xl:table-cell">Nacionalidad</th>
              <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {huespedes.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-text-muted text-sm">No hay huéspedes registrados</td></tr>
            ) : huespedes.map((h) => (
              <tr key={h.id} className={cn("border-b border-border/50 last:border-0 transition-colors", selected.has(h.id) ? "bg-primary/5" : "hover:bg-accent-primary/5")}>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selected.has(h.id)} onChange={() => toggleOne(h.id)} className="w-4 h-4 accent-primary rounded cursor-pointer" />
                </td>
                <td className="px-4 py-3 cursor-pointer" onClick={() => onRowClick(h)}>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-text-primary">{h.nombres} {h.apellidos}</p>
                      <div className="flex items-center gap-1 text-xs text-text-muted md:hidden">
                        <MdEmail className="w-3 h-3" />
                        <span className="truncate max-w-[160px]">{h.email}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-muted hidden sm:table-cell cursor-pointer" onClick={() => onRowClick(h)}>
                  {h.tipo_doc && <span className="text-xs bg-paper-medium/30 px-1.5 py-0.5 rounded mr-1">{h.tipo_doc}</span>}
                  {h.nro_doc ?? "—"}
                </td>
                <td className="px-4 py-3 hidden md:table-cell cursor-pointer" onClick={() => onRowClick(h)}>
                  <div className="flex items-center gap-1.5 text-text-muted">
                    <MdEmail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate max-w-[180px]">{h.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell cursor-pointer" onClick={() => onRowClick(h)}>
                  <div className="flex items-center gap-1.5 text-text-muted">
                    <MdPhone className="w-3.5 h-3.5 shrink-0" />
                    {h.telefono}
                  </div>
                </td>
                <td className="px-4 py-3 text-text-muted hidden xl:table-cell cursor-pointer" onClick={() => onRowClick(h)}>{h.nacionalidad}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onEdit(h)} title="Editar" className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"><MdEdit className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(h)} title="Eliminar" className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all"><MdDelete className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-text-muted px-1">
        <span>{total === 0 ? "Sin resultados" : `${from}–${to} de ${total} huésped${total !== 1 ? "es" : ""}`}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => onPageChange(1)} disabled={page === 1} className={cn("px-2 py-1.5 rounded-lg border transition-all", page === 1 ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>«</button>
          <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className={cn("px-3 py-1.5 rounded-lg border transition-all", page === 1 ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>Anterior</button>
          {pages.map((p, i) =>
            p === "..." ? (
              <span key={`e-${i}`} className="px-1">…</span>
            ) : (
              <button key={p} onClick={() => onPageChange(p as number)} className={cn("w-8 h-8 rounded-lg border text-xs transition-all", p === page ? "bg-primary text-white border-primary" : "border-border hover:border-primary/50 hover:text-primary")}>{p}</button>
            )
          )}
          <button onClick={() => onPageChange(page + 1)} disabled={!pagination.hasNextPage} className={cn("px-3 py-1.5 rounded-lg border transition-all", !pagination.hasNextPage ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>Siguiente</button>
          <button onClick={() => onPageChange(totalPages)} disabled={page === totalPages} className={cn("px-2 py-1.5 rounded-lg border transition-all", page === totalPages ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>»</button>
        </div>
      </div>
    </div>
  );
}

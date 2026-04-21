import { useState } from "react";
import { PanelHeader, Button, EmptyState, Loading } from "@/components";
import { useCategoriasMueble } from "../hooks/useCategoriasMueble";
import { CategoriaMuebleModal } from "./CategoriaMuebleModal";
import { cn } from "@/shared/utils/cn";
import type { CategoriaMueble, CreateCategoriaMueble } from "../types";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { MdCategory, MdSearch } from "react-icons/md";

export default function CategoriasMueblePage() {
  const { categorias, loading, error, fetchCategorias, createCategoria, updateCategoria, deleteCategoria } = useCategoriasMueble();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaMueble | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loading text="Cargando categorías..." /></div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-danger">{error}</div></div>;

  const handleSave = async (data: CreateCategoriaMueble) => {
    if (editingCategoria) return updateCategoria(editingCategoria.id, data);
    return createCategoria(data);
  };

  const handleDelete = async (cat: CategoriaMueble) => {
    const confirmed = window.confirm(`¿Eliminar la categoría "${cat.nombre}"?`);
    if (!confirmed) return;
    setDeleting(cat.id);
    try {
      await deleteCategoria(cat.id);
    } catch (err) {
      if (!isHandledError(err)) { sileo.error({ title: "Error", description: "No se pudo eliminar la categoría" }); }
    } finally {
      setDeleting(null);
    }
  };

  const openCreate = () => { setEditingCategoria(null); setIsModalOpen(true); };
  const openEdit = (cat: CategoriaMueble) => { setEditingCategoria(cat); setIsModalOpen(true); };

  const activas = categorias.filter((c) => c.activo).length;

  const filtered = categorias.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.nombre.toLowerCase().includes(q) || (c.descripcion ?? "").toLowerCase().includes(q);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const from = filtered.length === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, filtered.length);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
      acc.push(p); return acc;
    }, []);

  return (
    <>
      <PanelHeader
        title="Categorías de Muebles"
        subtitle="Gestión de categorías para el inventario de mobiliario"
        action={<Button onClick={openCreate}>+ Nueva Categoría</Button>}
      >
        {categorias.length === 0 ? (
          <EmptyState
            icon={<MdCategory className="w-10 h-10 text-text-muted/50" />}
            title="Sin categorías"
            description="Crea la primera categoría de muebles"
            action={<Button onClick={openCreate }>Nueva Categoría</Button>}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6">
              <div className="bg-gradient-to-br from-accent-primary/10 to-accent-light/10 rounded-2xl p-5 border border-accent-primary/20">
                <p className="text-text-muted text-sm">Total</p>
                <p className="text-2xl font-bold font-playfair mt-1">{categorias.length}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-40 to-emerald-100/50 rounded-2xl p-5 border border-emerald-200/50">
                <p className="text-text-muted text-sm">Activas</p>
                <p className="text-2xl font-bold font-playfair mt-1 text-emerald-500">{activas}</p>
              </div>
              <div className="bg-gradient-to-br from-paper-medium/20 to-paper-medium/10 rounded-2xl p-5 border border-border-light/50">
                <p className="text-text-muted text-sm">Inactivas</p>
                <p className="text-2xl font-bold font-playfair mt-1">{categorias.length - activas}</p>
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-3 flex items-center gap-3">
              <div className="relative flex-1">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por nombre o descripción..." className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-text-muted hidden sm:block">Mostrar</span>
                <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="text-sm rounded-xl border border-border bg-bg-card text-text-primary px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-xs text-text-muted hidden sm:block">filas</span>
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-text-muted font-semibold text-xs uppercase tracking-wide">Nombre</th>
                    <th className="text-left py-3 px-2 text-text-muted font-semibold text-xs uppercase tracking-wide hidden sm:table-cell">Descripción</th>
                    <th className="text-left py-3 px-2 text-text-muted font-semibold text-xs uppercase tracking-wide">Estado</th>
                    <th className="py-3 px-2 text-right text-text-muted font-semibold text-xs uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-10 text-text-muted">Sin resultados</td></tr>
                  ) : paginated.map((cat) => (
                    <tr key={cat.id} className="border-b border-border/50 last:border-0 hover:bg-accent-primary/5 transition-colors">
                      <td className="py-3 px-2 font-medium text-text-primary">{cat.nombre}</td>
                      <td className="py-3 px-2 text-text-muted hidden sm:table-cell">{cat.descripcion ?? "—"}</td>
                      <td className="py-3 px-2">
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", cat.activo ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600")}>
                          {cat.activo ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(cat)} className="text-xs px-3 py-1.5 rounded-lg bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 transition-all border border-accent-primary/20">Editar</button>
                          <button onClick={() => handleDelete(cat)} disabled={deleting === cat.id} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-danger hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50">{deleting === cat.id ? "..." : "Eliminar"}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-xs text-text-muted px-4 sm:px-6 py-4 border-t border-border/50">
              <span>{filtered.length === 0 ? "Sin resultados" : `${from}–${to} de ${filtered.length} categoría${filtered.length !== 1 ? "s" : ""}`}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(1)} disabled={page === 1} className={cn("px-2 py-1.5 rounded-lg border transition-all", page === 1 ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>«</button>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className={cn("px-3 py-1.5 rounded-lg border transition-all", page === 1 ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>Anterior</button>
                {pageNumbers.map((p, i) =>
                  p === "..." ? <span key={`e-${i}`} className="px-1">…</span> : (
                    <button key={p} onClick={() => setPage(p as number)} className={cn("w-8 h-8 rounded-lg border text-xs transition-all", p === page ? "bg-primary text-white border-primary" : "border-border hover:border-primary/50 hover:text-primary")}>{p}</button>
                  )
                )}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={cn("px-3 py-1.5 rounded-lg border transition-all", page === totalPages ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>Siguiente</button>
                <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className={cn("px-2 py-1.5 rounded-lg border transition-all", page === totalPages ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>»</button>
              </div>
            </div>
          </>
        )}
      </PanelHeader>

      <CategoriaMuebleModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCategoria(null); }}
        onSuccess={fetchCategorias}
        categoria={editingCategoria}
        onSave={handleSave}
      />
    </>
  );
}

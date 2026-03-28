import { useState } from "react";
import { PanelHeader, Button, EmptyState, Loading, Modal } from "@/components";
import { EstanciaModal } from "./EstanciaModal";
import { CheckoutModal } from "./CheckoutModal";
import { estadoEstadiaLabels, estadoEstadiaColors } from "../types";
import type { Estancia, CreateEstancia, EstadoEstadia } from "../types";
import { sileo } from "sileo";
import { isHandledError } from "@/utils/error.utils";
import { MdHotel, MdEdit, MdDelete, MdSearch, MdLogout } from "react-icons/md";
import { cn } from "@/utils/cn";
import { useEstancias } from "../hooks/useEstancias";

export default function EstanciasPage() {
  const { estancias, loading, error, fetchEstancias, createEstancia, updateEstancia, checkoutEstancia, deleteEstancia } = useEstancias();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [editingEstancia, setEditingEstancia] = useState<Estancia | null>(null);
  const [selectedEstancia, setSelectedEstancia] = useState<Estancia | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<EstadoEstadia | "">("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loading text="Cargando estancias..." /></div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-danger">{error}</div></div>;

  const handleSave = async (data: CreateEstancia) => {
    if (editingEstancia) return updateEstancia(editingEstancia.id, data);
    return createEstancia(data);
  };

  const handleDelete = async (e: Estancia) => {
    const confirmed = window.confirm(`¿Eliminar la estancia de "${e.huesped.nombres} ${e.huesped.apellidos}"?`);
    if (!confirmed) return;
    setDeleting(true);
    try {
      await deleteEstancia(e.id);
      if (selectedEstancia?.id === e.id) setSelectedEstancia(null);
    } catch (err) {
      if (!isHandledError(err)) sileo.error({ title: "Error", description: "No se pudo eliminar la estancia" });
    } finally {
      setDeleting(false);
    }
  };

  const openCreate = () => { setEditingEstancia(null); setIsModalOpen(true); };
  const openEdit = (e: Estancia) => { setEditingEstancia(e); setSelectedEstancia(null); setIsModalOpen(true); };
  const openCheckout = (e: Estancia) => { setSelectedEstancia(null); setEditingEstancia(e); setIsCheckoutOpen(true); };

  // Filtrado local
  const filtered = estancias.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      e.huesped.nombres.toLowerCase().includes(q) ||
      e.huesped.apellidos.toLowerCase().includes(q) ||
      e.habitacion.nro_habitacion.includes(q) ||
      e.reserva_id.toLowerCase().includes(q);
    const matchEstado = !filterEstado || e.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const from = filtered.length === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, filtered.length);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  const enCasa = estancias.filter((e) => e.estado === "EN_CASA").length;

  return (
    <>
      <PanelHeader
        title="Estancias"
        subtitle="Gestión de estancias y check-outs"
        action={<Button onClick={openCreate}>+ Nueva Estancia</Button>}
      >
        {estancias.length === 0 ? (
          <EmptyState
            icon={<MdHotel className="w-10 h-10 text-text-muted/50" />}
            title="Sin estancias"
            description="Registra la primera estancia"
            action={{ label: "Nueva Estancia", onClick: openCreate }}
          />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6">
              <div className="bg-gradient-to-br from-accent-primary/10 to-accent-light/10 rounded-2xl p-4 border border-accent-primary/20">
                <p className="text-text-muted text-xs">Total</p>
                <p className="text-2xl font-bold font-playfair mt-1">{estancias.length}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-40 to-emerald-100/50 rounded-2xl p-4 border border-emerald-200/50">
                <p className="text-text-muted text-xs">En Casa</p>
                <p className="text-2xl font-bold font-playfair mt-1 text-emerald-500">{enCasa}</p>
              </div>
              <div className="bg-gradient-to-br from-paper-medium/20 to-paper-medium/10 rounded-2xl p-4 border border-border-light/50">
                <p className="text-text-muted text-xs">Completadas / Salida</p>
                <p className="text-2xl font-bold font-playfair mt-1">{estancias.length - enCasa}</p>
              </div>
            </div>

            {/* Toolbar */}
            <div className="px-4 sm:px-6 pb-3 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Buscar por huésped, habitación, reserva..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-text-muted hidden sm:block">Mostrar</span>
                <select
                  value={perPage}
                  onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                  className="text-sm rounded-xl border border-border bg-bg-card text-text-primary px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-xs text-text-muted hidden sm:block">filas</span>
              </div>
            </div>

            {/* Estado filters */}
            <div className="px-4 sm:px-6 pb-3 flex gap-2 flex-wrap">
              <button onClick={() => { setFilterEstado(""); setPage(1); }} className={cn("text-xs px-3 py-1.5 rounded-xl border transition-all", filterEstado === "" ? "bg-primary text-white border-primary" : "border-border text-text-muted hover:border-primary/50")}>Todos</button>
              {(Object.keys(estadoEstadiaLabels) as EstadoEstadia[]).map((k) => (
                <button key={k} onClick={() => { setFilterEstado(k); setPage(1); }} className={cn("text-xs px-3 py-1.5 rounded-xl border transition-all", filterEstado === k ? "bg-primary text-white border-primary" : "border-border text-text-muted hover:border-primary/50")}>
                  {estadoEstadiaLabels[k]}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto px-4 sm:px-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Huésped</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">Habitación</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Entrada</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Salida</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Estado</th>
                    <th className="py-3 px-2 text-right text-xs font-semibold text-text-muted uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-text-muted">Sin resultados</td></tr>
                  ) : paginated.map((e) => (
                    <tr key={e.id} onClick={() => setSelectedEstancia(e)} className="border-b border-border/50 last:border-0 hover:bg-accent-primary/5 cursor-pointer transition-colors">
                      <td className="py-3 px-2">
                        <p className="font-medium text-text-primary">{e.huesped.nombres} {e.huesped.apellidos}</p>
                        <p className="text-xs text-text-muted hidden sm:block">{e.huesped.email}</p>
                      </td>
                      <td className="py-3 px-2 text-text-muted hidden sm:table-cell">Hab. {e.habitacion.nro_habitacion} — P{e.habitacion.piso}</td>
                      <td className="py-3 px-2 text-text-muted hidden md:table-cell">{new Date(e.fecha_entrada).toLocaleDateString("es-ES")}</td>
                      <td className="py-3 px-2 text-text-muted hidden md:table-cell">{e.fecha_salida ? new Date(e.fecha_salida).toLocaleDateString("es-ES") : "—"}</td>
                      <td className="py-3 px-2">
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", estadoEstadiaColors[e.estado])}>
                          {estadoEstadiaLabels[e.estado]}
                        </span>
                      </td>
                      <td className="py-3 px-2" onClick={(ev) => ev.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {e.estado === "EN_CASA" && (
                            <button onClick={() => openCheckout(e)} title="Check-out" className="p-1.5 rounded-lg text-text-muted hover:text-blue-600 hover:bg-blue-50 transition-all"><MdLogout className="w-4 h-4" /></button>
                          )}
                          <button onClick={() => openEdit(e)} title="Editar" className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"><MdEdit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(e)} disabled={deleting} title="Eliminar" className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all disabled:opacity-40"><MdDelete className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-xs text-text-muted px-4 sm:px-6 py-4 border-t border-border/50">
              <span>{filtered.length === 0 ? "Sin resultados" : `${from}–${to} de ${filtered.length} estancia${filtered.length !== 1 ? "s" : ""}`}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(1)} disabled={page === 1} className={cn("px-2 py-1.5 rounded-lg border transition-all", page === 1 ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>«</button>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className={cn("px-3 py-1.5 rounded-lg border transition-all", page === 1 ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>Anterior</button>
                {pages.map((p, i) =>
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

      <EstanciaModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingEstancia(null); }}
        onSuccess={fetchEstancias}
        estancia={editingEstancia}
        onSave={handleSave}
      />

      {editingEstancia && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => { setIsCheckoutOpen(false); setEditingEstancia(null); }}
          onSuccess={fetchEstancias}
          estancia={editingEstancia}
          onCheckout={checkoutEstancia}
        />
      )}

      {selectedEstancia && (
        <Modal isOpen={!!selectedEstancia} onClose={() => setSelectedEstancia(null)} title="Detalle de Estancia">
          <div className="space-y-4">
            <div className="text-center py-4 bg-paper-medium/20 rounded-2xl">
              <p className="text-xl font-bold font-playfair text-accent-primary">{selectedEstancia.huesped.nombres} {selectedEstancia.huesped.apellidos}</p>
              <p className="text-text-muted text-sm mt-1">Hab. {selectedEstancia.habitacion.nro_habitacion} — Piso {selectedEstancia.habitacion.piso}</p>
              <span className={cn("inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full", estadoEstadiaColors[selectedEstancia.estado])}>
                {estadoEstadiaLabels[selectedEstancia.estado]}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-paper-medium/20 rounded-xl p-3">
                <p className="text-text-muted text-xs">Entrada</p>
                <p className="text-sm font-medium">{new Date(selectedEstancia.fecha_entrada).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <div className="bg-paper-medium/20 rounded-xl p-3">
                <p className="text-text-muted text-xs">Salida</p>
                <p className="text-sm font-medium">{selectedEstancia.fecha_salida ? new Date(selectedEstancia.fecha_salida).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "—"}</p>
              </div>
            </div>
            {selectedEstancia.notas && (
              <div className="bg-paper-medium/10 rounded-xl p-3">
                <p className="text-text-muted text-xs">Notas</p>
                <p className="text-sm">{selectedEstancia.notas}</p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              {selectedEstancia.estado === "EN_CASA" && (
                <button onClick={() => openCheckout(selectedEstancia)} className="flex-1 py-3 bg-blue-50 text-blue-700 font-medium rounded-xl hover:bg-blue-100 transition-all border border-blue-200">Check-out</button>
              )}
              <button onClick={() => openEdit(selectedEstancia)} className="flex-1 py-3 bg-accent-primary/10 text-accent-primary font-medium rounded-xl hover:bg-accent-primary/20 transition-all border border-accent-primary/20">Editar</button>
              <button onClick={() => handleDelete(selectedEstancia)} disabled={deleting} className="flex-1 py-3 bg-red-50 text-danger font-medium rounded-xl hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50">{deleting ? "..." : "Eliminar"}</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

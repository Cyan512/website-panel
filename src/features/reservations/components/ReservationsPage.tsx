import { useState } from "react";
import { PanelHeader, Button, EmptyState, Loading, Modal } from "@/components";
import { useHuespedes } from "@/features/clients/hooks/useHuespedes";
import { useHabitaciones } from "@/features/rooms/hooks/useRooms";
import { useTarifas } from "@/features/rates/hooks/useTarifas";
import { ReservaModal } from "./ReservaModal";
import { CancelModal } from "./CancelModal";
import { estadoReservaLabels, estadoReservaColors } from "../types";
import type { Reserva, CreateReserva, UpdateReserva, EstadoReserva } from "../types";
import { sileo } from "sileo";
import { isHandledError } from "@/utils/error.utils";
import { MdEventNote, MdEdit, MdDelete, MdCancel, MdSearch } from "react-icons/md";
import { cn } from "@/utils/cn";
import { useReservas } from "../hooks/useReservas";

export default function ReservationsPage() {
  const { reservas, loading, error, fetchReservas, createReserva, updateReserva, cancelReserva, deleteReserva } = useReservas();
  const { huespedes } = useHuespedes();
  const { habitaciones } = useHabitaciones();
  const { tarifas } = useTarifas();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [cancelingReserva, setCancelingReserva] = useState<Reserva | null>(null);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<EstadoReserva | "">("");
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loading text="Cargando reservas..." /></div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-danger">{error}</div></div>;

  const filtered = reservas.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.codigo.toLowerCase().includes(q) ||
      r.nombre_huesped.toLowerCase().includes(q) ||
      r.nro_habitacion.includes(q);
    const matchEstado = !filterEstado || r.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const from = filtered.length === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, filtered.length);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  const handleCreate = async (data: CreateReserva) => createReserva(data);
  const handleUpdate = async (data: UpdateReserva) => {
    if (!editingReserva) throw new Error("No hay reserva seleccionada");
    return updateReserva(editingReserva.id, data);
  };

  const handleDelete = async (r: Reserva) => {
    const confirmed = window.confirm(`¿Eliminar la reserva "${r.codigo}"?`);
    if (!confirmed) return;
    setDeleting(true);
    try {
      await deleteReserva(r.id);
      if (selectedReserva?.id === r.id) setSelectedReserva(null);
    } catch (err) {
      if (!isHandledError(err)) { sileo.error({ title: "Error", description: "No se pudo eliminar la reserva" }); }
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (r: Reserva) => { setEditingReserva(r); setSelectedReserva(null); setIsModalOpen(true); };
  const openCancel = (r: Reserva) => { setCancelingReserva(r); setSelectedReserva(null); setIsCancelOpen(true); };

  const counts = {
    total: reservas.length,
    confirmadas: reservas.filter((r) => r.estado === "CONFIRMADA").length,
    enCasa: reservas.filter((r) => r.estado === "EN_CASA").length,
    canceladas: reservas.filter((r) => r.estado === "CANCELADA").length,
  };

  const noches = (r: Reserva) =>
    Math.ceil((new Date(r.fecha_salida).getTime() - new Date(r.fecha_entrada).getTime()) / 86400000);

  return (
    <>
      <PanelHeader
        title="Reservas"
        subtitle="Gestión de reservas del hotel"
        action={<Button onClick={() => { setEditingReserva(null); setIsModalOpen(true); }}>+ Nueva Reserva</Button>}
      >
        {reservas.length === 0 ? (
          <EmptyState
            icon={<MdEventNote className="w-10 h-10 text-text-muted/50" />}
            title="Sin reservas"
            description="Crea la primera reserva"
            action={{ label: "Nueva Reserva", onClick: () => setIsModalOpen(true) }}
          />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 sm:p-6">
              <div className="bg-gradient-to-br from-accent-primary/10 to-accent-light/10 rounded-2xl p-4 border border-accent-primary/20">
                <p className="text-text-muted text-xs">Total</p>
                <p className="text-2xl font-bold font-playfair mt-1">{counts.total}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-40 to-emerald-100/50 rounded-2xl p-4 border border-emerald-200/50">
                <p className="text-text-muted text-xs">Confirmadas</p>
                <p className="text-2xl font-bold font-playfair mt-1 text-emerald-500">{counts.confirmadas}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-40 to-blue-100/50 rounded-2xl p-4 border border-blue-200/50">
                <p className="text-text-muted text-xs">En Casa</p>
                <p className="text-2xl font-bold font-playfair mt-1 text-blue-500">{counts.enCasa}</p>
              </div>
              <div className="bg-gradient-to-br from-red-40 to-red-100/50 rounded-2xl p-4 border border-red-200/50">
                <p className="text-text-muted text-xs">Canceladas</p>
                <p className="text-2xl font-bold font-playfair mt-1 text-red-500">{counts.canceladas}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="px-4 sm:px-6 pb-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Buscar por código, huésped, habitación..."
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
            <div className="px-4 sm:px-6 pb-3 flex gap-2 flex-wrap">
              <button onClick={() => { setFilterEstado(""); setPage(1); }} className={cn("text-xs px-3 py-2 rounded-xl border transition-all", filterEstado === "" ? "bg-primary text-white border-primary" : "border-border text-text-muted hover:border-primary/50")}>Todos</button>
              {(Object.keys(estadoReservaLabels) as EstadoReserva[]).map((k) => (
                <button key={k} onClick={() => { setFilterEstado(k); setPage(1); }} className={cn("text-xs px-3 py-2 rounded-xl border transition-all", filterEstado === k ? "bg-primary text-white border-primary" : "border-border text-text-muted hover:border-primary/50")}>
                  {estadoReservaLabels[k]}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto px-4 sm:px-6 pb-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Código</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Huésped</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">Habitación</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Fechas</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden lg:table-cell">Huéspedes</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Estado</th>
                    <th className="py-3 px-2 text-right text-xs font-semibold text-text-muted uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-text-muted">Sin resultados</td></tr>
                  ) : paginated.map((r) => (
                    <tr key={r.id} onClick={() => setSelectedReserva(r)} className="border-b border-border/50 last:border-0 hover:bg-accent-primary/5 cursor-pointer transition-colors">
                      <td className="py-3 px-2 font-mono text-xs font-medium text-accent-primary">{r.codigo}</td>
                      <td className="py-3 px-2">
                        <p className="font-medium text-text-primary">{r.nombre_huesped}</p>
                      </td>
                      <td className="py-3 px-2 text-text-muted hidden sm:table-cell">Hab. {r.nro_habitacion}</td>
                      <td className="py-3 px-2 hidden md:table-cell">
                        <p className="text-text-primary text-xs">{new Date(r.fecha_entrada).toLocaleDateString("es-ES")}</p>
                        <p className="text-text-muted text-xs">{new Date(r.fecha_salida).toLocaleDateString("es-ES")} · {noches(r)}n</p>
                      </td>
                      <td className="py-3 px-2 text-text-muted hidden lg:table-cell">{r.adultos}A {r.ninos > 0 ? `${r.ninos}N` : ""}</td>
                      <td className="py-3 px-2">
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", estadoReservaColors[r.estado])}>
                          {estadoReservaLabels[r.estado]}
                        </span>
                      </td>
                      <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(r)} title="Editar" className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"><MdEdit className="w-4 h-4" /></button>
                          {r.estado !== "CANCELADA" && r.estado !== "COMPLETADA" && r.estado !== "NO_LLEGO" && (
                            <button onClick={() => openCancel(r)} title="Cancelar" className="p-1.5 rounded-lg text-text-muted hover:text-amber-600 hover:bg-amber-50 transition-all"><MdCancel className="w-4 h-4" /></button>
                          )}
                          <button onClick={() => handleDelete(r)} disabled={deleting} title="Eliminar" className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all disabled:opacity-40"><MdDelete className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-xs text-text-muted px-4 sm:px-6 py-4 border-t border-border/50">
              <span>{filtered.length === 0 ? "Sin resultados" : `${from}–${to} de ${filtered.length} reserva${filtered.length !== 1 ? "s" : ""}`}</span>
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

      <ReservaModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingReserva(null); }}
        onSuccess={fetchReservas}
        reserva={editingReserva}
        huespedes={huespedes}
        habitaciones={habitaciones}
        tarifas={tarifas}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      {cancelingReserva && (
        <CancelModal
          isOpen={isCancelOpen}
          onClose={() => { setIsCancelOpen(false); setCancelingReserva(null); }}
          onSuccess={fetchReservas}
          reserva={cancelingReserva}
          onCancel={cancelReserva}
        />
      )}

      {selectedReserva && (
        <Modal isOpen={!!selectedReserva} onClose={() => setSelectedReserva(null)} title={`Reserva ${selectedReserva.codigo}`}>
          <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-sm">Estado</span>
                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", estadoReservaColors[selectedReserva.estado])}>
                  {estadoReservaLabels[selectedReserva.estado]}
                </span>
              </div>
              {[
                { label: "Huésped", value: selectedReserva.nombre_huesped },
                { label: "Habitación", value: `Nro. ${selectedReserva.nro_habitacion}` },
                { label: "Tipo hab.", value: selectedReserva.nombre_tipo_hab },
                { label: "Canal", value: selectedReserva.nombre_canal },
                { label: "Entrada", value: new Date(selectedReserva.fecha_entrada).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) },
                { label: "Salida", value: new Date(selectedReserva.fecha_salida).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) },
                { label: "Noches", value: String(noches(selectedReserva)) },
                { label: "Huéspedes", value: `${selectedReserva.adultos} adulto${selectedReserva.adultos !== 1 ? "s" : ""}${selectedReserva.ninos > 0 ? ` · ${selectedReserva.ninos} niño${selectedReserva.ninos !== 1 ? "s" : ""}` : ""}` },
                { label: "Precio/noche", value: `${selectedReserva.tarifa.moneda} ${selectedReserva.precio_noche}` },
                { label: "Total", value: `${selectedReserva.tarifa.moneda} ${selectedReserva.monto_final.toFixed(2)}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-4 bg-paper-medium/10 rounded-xl px-3 py-2.5">
                  <span className="text-text-muted text-xs shrink-0">{label}</span>
                  <span className="text-text-primary text-sm font-medium text-right">{value}</span>
                </div>
              ))}
              {selectedReserva.monto_descuento != null && selectedReserva.monto_descuento > 0 && (
                <div className="flex justify-between items-start gap-4 bg-paper-medium/10 rounded-xl px-3 py-2.5">
                  <span className="text-text-muted text-xs">Descuento</span>
                  <span className="text-danger text-sm font-medium">− {selectedReserva.tarifa.moneda} {selectedReserva.monto_descuento.toFixed(2)}</span>
                </div>
              )}
              {selectedReserva.motivo_cancel && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <p className="text-xs text-text-muted">Motivo cancelación</p>
                  <p className="text-sm text-danger mt-0.5">{selectedReserva.motivo_cancel}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => openEdit(selectedReserva)} className="flex-1 py-3 bg-accent-primary/10 text-accent-primary font-medium rounded-xl hover:bg-accent-primary/20 transition-all border border-accent-primary/20">Editar</button>
                {selectedReserva.estado !== "CANCELADA" && selectedReserva.estado !== "COMPLETADA" && selectedReserva.estado !== "NO_LLEGO" && (
                  <button onClick={() => openCancel(selectedReserva)} className="flex-1 py-3 bg-amber-50 text-amber-700 font-medium rounded-xl hover:bg-amber-100 transition-all border border-amber-200">Cancelar</button>
                )}
                <button onClick={() => handleDelete(selectedReserva)} disabled={deleting} className="flex-1 py-3 bg-red-50 text-danger font-medium rounded-xl hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50">Eliminar</button>
              </div>
          </div>
        </Modal>
      )}
    </>
  );
}

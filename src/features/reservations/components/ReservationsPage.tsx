import { useState } from "react";
import { PanelHeader, Button, EmptyState, Modal } from "@/components";
import { useHuespedes } from "@/features/clients/hooks/useHuespedes";
import { useHabitaciones } from "@/features/rooms/hooks/useRooms";
import { useTarifas } from "@/features/rates/hooks/useTarifas";
import { ReservaModal } from "./ReservaModal";
import { CancelModal } from "./CancelModal";
import { estadoReservaLabels, estadoReservaColors } from "../types";
import type { Reserva, CreateReserva, UpdateReserva } from "../types";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { MdEventNote, MdEdit, MdDelete, MdCancel, MdSearch } from "react-icons/md";
import { cn } from "@/shared/utils/cn";
import { useReservas } from "../hooks/useReservas";
import { formatUTCDate, formatUTCDateLong } from "@/shared/utils/format";

export default function ReservationsPage() {
  const {
    reservas, pagination, page, limit, search, loading, error,
    fetchReservas, goToPage, changeLimit, changeSearch, changeTipo,
    createReserva, updateReserva, cancelReserva, deleteReserva,
  } = useReservas();

  const { huespedes } = useHuespedes();
  const { habitaciones } = useHabitaciones();
  const { tarifas } = useTarifas();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [cancelingReserva, setCancelingReserva] = useState<Reserva | null>(null);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [tipoSearch, setTipoSearch] = useState("");
  const [deleting, setDeleting] = useState(false);

  if (error) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-danger">{error}</div></div>;

  const filtered = reservas;

  const { total, totalPages, hasNextPage } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
      acc.push(p); return acc;
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
      if (!isHandledError(err)) sileo.error({ title: "Error", description: "No se pudo eliminar la reserva" });
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (r: Reserva) => { setEditingReserva(r); setSelectedReserva(null); setIsModalOpen(true); };
  const openCancel = (r: Reserva) => { setCancelingReserva(r); setSelectedReserva(null); setIsCancelOpen(true); };
  const noches = (r: Reserva) => Math.ceil((new Date(r.fecha_fin).getTime() - new Date(r.fecha_inicio).getTime()) / 86400000);

  const counts = {
    total: pagination.total,
    confirmadas: reservas.filter((r) => r.estado === "CONFIRMADA").length,
    enCasa: reservas.filter((r) => r.estado === "EN_CASA").length,
    canceladas: reservas.filter((r) => r.estado === "CANCELADA").length,
  };

  return (
    <>
      <PanelHeader
        title="Reservas"
        subtitle="Gestión de reservas del hotel"
        action={<Button onClick={() => { setEditingReserva(null); setIsModalOpen(true); }}>+ Nueva Reserva</Button>}
      >
        {total === 0 && !search && !tipoSearch ? (
          <EmptyState icon={<MdEventNote className="w-10 h-10 text-text-muted/50" />} title="Sin reservas" description="Crea la primera reserva" action={<Button onClick={() => setIsModalOpen(true) }>Nueva Reserva</Button>} />
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

            {/* Toolbar */}
            <div className="px-4 sm:px-6 pb-3 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => changeSearch(e.target.value)}                  
                  placeholder="Buscar por nombre de huésped..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="relative flex-1">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={tipoSearch}
                  onChange={(e) => { setTipoSearch(e.target.value); changeTipo(e.target.value); }}
                  placeholder="Filtrar por tipo habitación (ej: Suite, Doble...)"
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>


              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-text-muted hidden sm:block">Mostrar</span>
                <select value={limit} onChange={(e) => changeLimit(Number(e.target.value))} className="text-sm rounded-xl border border-border bg-bg-card text-text-primary px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-xs text-text-muted hidden sm:block">filas</span>
              </div>
            </div>

            {/* Filtro tipo de habitación */}
            

            {/* Table */}
            <div className="overflow-x-auto px-4 sm:px-6 pb-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Código</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Huésped</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">Habitación</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Fechas</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden lg:table-cell">Pax</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Estado</th>
                    <th className="py-3 px-2 text-right text-xs font-semibold text-text-muted uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-10 text-text-muted text-sm">Buscando...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-text-muted">Sin resultados</td></tr>
                  ) : filtered.map((r) => (
                    <tr key={r.id} onClick={() => setSelectedReserva(r)} className="border-b border-border/50 last:border-0 hover:bg-accent-primary/5 cursor-pointer transition-colors">
                      <td className="py-3 px-2 font-mono text-xs font-medium text-accent-primary">{r.codigo}</td>
                      <td className="py-3 px-2 font-medium text-text-primary">{r.nombre_huesped}</td>
                      <td className="py-3 px-2 text-text-muted hidden sm:table-cell">Hab. {r.nro_habitacion}</td>
                      <td className="py-3 px-2 hidden md:table-cell">
                        <p className="text-text-primary text-xs">{formatUTCDate(r.fecha_inicio)}</p>
                        <p className="text-text-muted text-xs">{formatUTCDate(r.fecha_fin)} · {noches(r)}n</p>
                      </td>
                      <td className="py-3 px-2 text-text-muted hidden lg:table-cell">{r.adultos}A{r.ninos > 0 ? ` ${r.ninos}N` : ""}</td>
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
              <span>{total === 0 ? "Sin resultados" : `${from}–${to} de ${total} reserva${total !== 1 ? "s" : ""}`}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => goToPage(1)} disabled={page === 1} className={cn("px-2 py-1.5 rounded-lg border transition-all", page === 1 ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>«</button>
                <button onClick={() => goToPage(page - 1)} disabled={page === 1} className={cn("px-3 py-1.5 rounded-lg border transition-all", page === 1 ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>Anterior</button>
                {pageNumbers.map((p, i) =>
                  p === "..." ? <span key={`e-${i}`} className="px-1">…</span> : (
                    <button key={p} onClick={() => goToPage(p as number)} className={cn("w-8 h-8 rounded-lg border text-xs transition-all", p === page ? "bg-primary text-white border-primary" : "border-border hover:border-primary/50 hover:text-primary")}>{p}</button>
                  )
                )}
                <button onClick={() => goToPage(page + 1)} disabled={!hasNextPage} className={cn("px-3 py-1.5 rounded-lg border transition-all", !hasNextPage ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>Siguiente</button>
                <button onClick={() => goToPage(totalPages)} disabled={page === totalPages} className={cn("px-2 py-1.5 rounded-lg border transition-all", page === totalPages ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>»</button>
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
              { label: "Entrada", value: formatUTCDateLong(selectedReserva.fecha_inicio) },
              { label: "Salida", value: formatUTCDateLong(selectedReserva.fecha_fin) },
              { label: "Noches", value: String(selectedReserva.cantidad_noches) },
              { label: "Huéspedes", value: `${selectedReserva.adultos}A${selectedReserva.ninos > 0 ? ` · ${selectedReserva.ninos}N` : ""}` },
              { label: "Total", value: `S/ ${selectedReserva.monto_total.toFixed(2)}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-start gap-4 bg-paper-medium/10 rounded-xl px-3 py-2.5">
                <span className="text-text-muted text-xs shrink-0">{label}</span>
                <span className="text-text-primary text-sm font-medium text-right">{value}</span>
              </div>
            ))}
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

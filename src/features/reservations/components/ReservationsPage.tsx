import { useState } from "react";
import { PanelHeader, Button, EmptyState, Loading, Modal } from "@/components";
import { useHuespedes } from "@/features/clients/hooks/useHuespedes";
import { useHabitaciones } from "@/features/rooms/hooks/useRooms";
import { useTarifas } from "@/features/rates/hooks/useTarifas";
import { ReservaModal } from "./ReservaModal";
import { CancelModal } from "./CancelModal";
import { estadoReservaLabels, estadoReservaColors } from "../types";
import type { ReservaOutput, CreateReservaInput, EstadoReserva } from "../types";
import { sileo } from "sileo";
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
  const [editingReserva, setEditingReserva] = useState<ReservaOutput | null>(null);
  const [cancelingReserva, setCancelingReserva] = useState<ReservaOutput | null>(null);
  const [selectedReserva, setSelectedReserva] = useState<ReservaOutput | null>(null);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<EstadoReserva | "">("");
  const [deleting, setDeleting] = useState(false);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loading text="Cargando reservas..." /></div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-danger">{error}</div></div>;

  const filtered = reservas.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.codigo.toLowerCase().includes(q) ||
      r.huesped.nombres.toLowerCase().includes(q) ||
      r.huesped.apellidos.toLowerCase().includes(q) ||
      r.habitacion.nro_habitacion.includes(q);
    const matchEstado = !filterEstado || r.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const handleSave = async (data: CreateReservaInput) => {
    if (editingReserva) return updateReserva(editingReserva.id, data);
    return createReserva(data);
  };

  const handleDelete = async (r: ReservaOutput) => {
    const confirmed = window.confirm(`¿Eliminar la reserva "${r.codigo}"?`);
    if (!confirmed) return;
    setDeleting(true);
    try {
      await deleteReserva(r.id);
      if (selectedReserva?.id === r.id) setSelectedReserva(null);
    } catch {
      sileo.error({ title: "Error", description: "No se pudo eliminar la reserva" });
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (r: ReservaOutput) => { setEditingReserva(r); setSelectedReserva(null); setIsModalOpen(true); };
  const openCancel = (r: ReservaOutput) => { setCancelingReserva(r); setSelectedReserva(null); setIsCancelOpen(true); };

  const counts = {
    total: reservas.length,
    confirmadas: reservas.filter((r) => r.estado === "CONFIRMADA").length,
    pendientes: reservas.filter((r) => r.estado === "PENDIENTE").length,
    canceladas: reservas.filter((r) => r.estado === "CANCELADA").length,
  };

  const noches = (r: ReservaOutput) =>
    Math.ceil((new Date(r.fechaSalida).getTime() - new Date(r.fechaEntrada).getTime()) / 86400000);

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
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-4 border border-emerald-200/50">
                <p className="text-text-muted text-xs">Confirmadas</p>
                <p className="text-2xl font-bold font-playfair mt-1 text-emerald-700">{counts.confirmadas}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-4 border border-amber-200/50">
                <p className="text-text-muted text-xs">Pendientes</p>
                <p className="text-2xl font-bold font-playfair mt-1 text-amber-700">{counts.pendientes}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-4 border border-red-200/50">
                <p className="text-text-muted text-xs">Canceladas</p>
                <p className="text-2xl font-bold font-playfair mt-1 text-red-700">{counts.canceladas}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="px-4 sm:px-6 pb-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por código, huésped, habitación..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setFilterEstado("")} className={cn("text-xs px-3 py-2 rounded-xl border transition-all", filterEstado === "" ? "bg-primary text-white border-primary" : "border-border text-text-muted hover:border-primary/50")}>Todos</button>
                {(Object.keys(estadoReservaLabels) as EstadoReserva[]).map((k) => (
                  <button key={k} onClick={() => setFilterEstado(k)} className={cn("text-xs px-3 py-2 rounded-xl border transition-all", filterEstado === k ? "bg-primary text-white border-primary" : "border-border text-text-muted hover:border-primary/50")}>
                    {estadoReservaLabels[k]}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto px-4 sm:px-6 pb-6">
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
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-text-muted">Sin resultados</td></tr>
                  ) : filtered.map((r) => (
                    <tr key={r.id} onClick={() => setSelectedReserva(r)} className="border-b border-border/50 last:border-0 hover:bg-accent-primary/5 cursor-pointer transition-colors">
                      <td className="py-3 px-2 font-mono text-xs font-medium text-accent-primary">{r.codigo}</td>
                      <td className="py-3 px-2">
                        <p className="font-medium text-text-primary">{r.huesped.nombres} {r.huesped.apellidos}</p>
                      </td>
                      <td className="py-3 px-2 text-text-muted hidden sm:table-cell">Hab. {r.habitacion.nro_habitacion}</td>
                      <td className="py-3 px-2 hidden md:table-cell">
                        <p className="text-text-primary text-xs">{new Date(r.fechaEntrada).toLocaleDateString("es-ES")}</p>
                        <p className="text-text-muted text-xs">{new Date(r.fechaSalida).toLocaleDateString("es-ES")} · {noches(r)}n</p>
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
                          {r.estado !== "CANCELADA" && r.estado !== "COMPLETADA" && (
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
        onSave={handleSave}
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
                { label: "Huésped", value: `${selectedReserva.huesped.nombres} ${selectedReserva.huesped.apellidos}` },
                { label: "Habitación", value: `Nro. ${selectedReserva.habitacion.nro_habitacion} — Piso ${selectedReserva.habitacion.piso}` },
                { label: "Tarifa", value: `${selectedReserva.tarifa.tipo_habitacion.nombre} · ${selectedReserva.tarifa.canal.nombre}` },
                { label: "Entrada", value: new Date(selectedReserva.fechaEntrada).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) },
                { label: "Salida", value: new Date(selectedReserva.fechaSalida).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) },
                { label: "Noches", value: String(noches(selectedReserva)) },
                { label: "Huéspedes", value: `${selectedReserva.adultos} adulto${selectedReserva.adultos !== 1 ? "s" : ""}${selectedReserva.ninos > 0 ? ` · ${selectedReserva.ninos} niño${selectedReserva.ninos !== 1 ? "s" : ""}` : ""}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-4 bg-paper-medium/10 rounded-xl px-3 py-2.5">
                  <span className="text-text-muted text-xs shrink-0">{label}</span>
                  <span className="text-text-primary text-sm font-medium text-right">{value}</span>
                </div>
              ))}
              {selectedReserva.montoDescuento != null && selectedReserva.montoDescuento > 0 && (
                <div className="flex justify-between items-start gap-4 bg-paper-medium/10 rounded-xl px-3 py-2.5">
                  <span className="text-text-muted text-xs">Descuento</span>
                  <span className="text-danger text-sm font-medium">− {selectedReserva.tarifa.moneda} {selectedReserva.montoDescuento.toFixed(2)}</span>
                </div>
              )}
              {selectedReserva.motivoCancel && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <p className="text-xs text-text-muted">Motivo cancelación</p>
                  <p className="text-sm text-danger mt-0.5">{selectedReserva.motivoCancel}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => openEdit(selectedReserva)} className="flex-1 py-3 bg-accent-primary/10 text-accent-primary font-medium rounded-xl hover:bg-accent-primary/20 transition-all border border-accent-primary/20">Editar</button>
                {selectedReserva.estado !== "CANCELADA" && selectedReserva.estado !== "COMPLETADA" && (
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

import { useState } from "react";
import { PanelHeader, Button, EmptyState, Modal, Pagination, ConfirmDialog } from "@/components";
import { useTiposHabitacion } from "@/features/rooms/hooks/useRooms";
import { useTarifas } from "@/features/rates/hooks/useTarifas";
import { ReservaModal } from "./ReservaModal";
import { CancelModal } from "./CancelModal";
import { ReservaTable } from "./ReservaTable";
import { estadoReservaLabels, estadoReservaColors } from "../types";
import type { Reserva, CreateReserva, UpdateReserva } from "../types";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { MdEventNote, MdSearch } from "react-icons/md";
import { cn } from "@/shared/utils/cn";
import { useReservas } from "../hooks/useReservas";
import { formatUTCDateLong } from "@/shared/utils/format";

export default function ReservationsPage() {
  const {
    reservas, pagination, page, limit, search, loading, error,
    fetchReservas, goToPage, changeLimit, changeSearch, changeTipo,
    createReserva, updateReserva, cancelReserva, deleteReserva,
  } = useReservas();

  const { tarifas } = useTarifas();
  const { tipos } = useTiposHabitacion();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [cancelingReserva, setCancelingReserva] = useState<Reserva | null>(null);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [tipoSearch, setTipoSearch] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Reserva | null>(null);

  if (error) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-danger">{error}</div></div>;

  const filtered = reservas;

  const { total, totalPages, hasNextPage } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const handleCreate = async (data: CreateReserva) => createReserva(data);
  const handleUpdate = async (data: UpdateReserva) => {
    if (!editingReserva) throw new Error("No hay reserva seleccionada");
    return updateReserva(editingReserva.id, data);
  };

  const requestDelete = (r: Reserva) => setDeleteTarget(r);

  const handleDelete = async (r: Reserva) => {
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-accent-primary/10 to-accent-light/10 rounded-2xl p-4 border border-accent-primary/20">
                <p className="text-text-muted text-xs">Total</p>
                <p className="text-2xl font-bold font-display mt-1">{counts.total}</p>
              </div>
              <div className="bg-gradient-to-br from-success/30 to-success-bg rounded-2xl p-4 border border-success/20">
                <p className="text-text-muted text-xs">Confirmadas</p>
                <p className="text-2xl font-bold font-display mt-1 text-success">{counts.confirmadas}</p>
              </div>
              <div className="bg-gradient-to-br from-info/30 to-info-bg rounded-2xl p-4 border border-info/20">
                <p className="text-text-muted text-xs">En Casa</p>
                <p className="text-2xl font-bold font-display mt-1 text-info">{counts.enCasa}</p>
              </div>
              <div className="bg-gradient-to-br from-danger/30 to-danger-bg rounded-2xl p-4 border border-danger/20">
                <p className="text-text-muted text-xs">Canceladas</p>
                <p className="text-2xl font-bold font-display mt-1 text-danger">{counts.canceladas}</p>
              </div>
            </div>

  

            {/* Search and Filter Row */}
            <div className="flex gap-2 items-center">
              <div className="relative flex-1 max-w-xs">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => changeSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              

              <select
                value={tipoSearch}
                onChange={(e) => { setTipoSearch(e.target.value); changeTipo(e.target.value); }}
                className="text-sm rounded-lg border border-border bg-bg-card text-text-primary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Todos los tipos</option>
                {tipos.map((tipo) => (
                  <option key={tipo.id} value={tipo.nombre}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro tipo de habitación */}

            

            {/* Table */}
            <div className="overflow-hidden px-4 sm:px-6">
              <ReservaTable
                reservas={filtered}
                loading={loading}
                selectedReserva={selectedReserva}
                onSelect={setSelectedReserva}
                onEdit={openEdit}
                onCancel={openCancel}
                onDelete={requestDelete}
                deleting={deleting}
              />
            </div>

            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              pageSizeValue={limit}
              onPageSizeChange={(v) => changeLimit(v)}
              pageSizeOptions={[5, 10, 25, 50]}
              hasNextPage={hasNextPage}
              onPageChange={goToPage}
              label={total === 0 ? "Sin resultados" : `${from}–${to} de ${total} reserva${total !== 1 ? "s" : ""}`}
            />
          </>
        )}
      </PanelHeader>

      <ReservaModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingReserva(null); }}
        onSuccess={fetchReservas}
        reserva={editingReserva}
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
              <div className="bg-danger-bg border border-danger/20 rounded-xl px-3 py-2.5">
                <p className="text-xs text-text-muted">Motivo cancelación</p>
                <p className="text-sm text-danger mt-0.5">{selectedReserva.motivo_cancel}</p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={() => openEdit(selectedReserva)} className="flex-1 py-3 bg-accent-primary/10 text-accent-primary font-medium rounded-xl hover:bg-accent-primary/20 transition-all border border-accent-primary/20">Editar</button>
              {selectedReserva.estado !== "CANCELADA" && selectedReserva.estado !== "COMPLETADA" && selectedReserva.estado !== "NO_LLEGO" && (
                <button onClick={() => openCancel(selectedReserva)} className="flex-1 py-3 bg-warning-bg text-warning font-medium rounded-xl hover:bg-warning-bg/80 transition-all border border-warning/20">Cancelar</button>
              )}
              <button onClick={() => requestDelete(selectedReserva)} disabled={deleting} className="flex-1 py-3 bg-danger-bg text-danger font-medium rounded-xl hover:bg-danger-bg transition-all border border-danger/20 disabled:opacity-50">Eliminar</button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar reserva"
        description={deleteTarget ? `¿Eliminar la reserva "${deleteTarget.codigo}"?` : undefined}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        isConfirmLoading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const target = deleteTarget;
          setDeleteTarget(null);
          await handleDelete(target);
        }}
      />
    </>
  );
}

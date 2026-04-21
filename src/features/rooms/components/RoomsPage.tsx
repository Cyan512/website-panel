import { useState } from "react";
import { useHabitaciones } from "../hooks/useRooms";
import { RoomCard } from "./RoomCard";
import { RoomModal } from "./RoomModal";
import { ImageCarousel } from "./ImageCarousel";
import { RoomCalendar } from "./RoomCalendar";
import { PanelHeader, Button, Modal, CrudToolbar, Pagination, ConfirmDialog } from "@/components";
import { cn } from "@/shared/utils/cn";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { MdSearch } from "react-icons/md";
import { obtenerEstadoHabitacion, estadoHabitacionColors } from "@/shared/utils/habitacion";
import type { Habitacion, FechaReserva } from "../types";
import { roomsApi } from "../api";
import { usePromociones } from "@/features/promotions/hooks/usePromociones";
import { formatUTCDate } from "@/shared/utils/format";

export default function RoomsPage() {
  const {
    habitaciones, pagination, page, limit, loading, error,
    fetchHabitaciones, goToPage, changeLimit, changeTipo,
    deleteHabitacion,
  } = useHabitaciones();

  const { promociones } = usePromociones();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHabitacion, setSelectedHabitacion] = useState<Habitacion | null>(null);
  const [editingHabitacion, setEditingHabitacion] = useState<Habitacion | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [tipoSearch, setTipoSearch] = useState("");
  const [fechasReserva, setFechasReserva] = useState<FechaReserva[]>([]);
  const [muebles, setMuebles] = useState<import("../types").HabitacionMueble[]>([]);
  const [loadingFechas, setLoadingFechas] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleSelectHabitacion = async (hab: Habitacion) => {
    setSelectedHabitacion(hab);
    setFechasReserva([]);
    setMuebles([]);
    setCalendarOpen(false);
    setLoadingFechas(true);
    try {
      const detail = await roomsApi.getById(hab.id, ["TENTATIVA", "CONFIRMADA", "EN_CASA"]);
      setFechasReserva(detail.fechas_reserva ?? []);
      setMuebles(detail.muebles ?? []);
    } catch {
      setFechasReserva([]);
      setMuebles([]);
    } finally {
      setLoadingFechas(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedHabitacion) return;
    setDeleting(true);
    try {
      await deleteHabitacion(selectedHabitacion.id);
      setSelectedHabitacion(null);
    } catch (err) {
      if (!isHandledError(err)) sileo.error({ title: "Error", description: "No se pudo eliminar la habitación." });
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (habitacion: Habitacion, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedHabitacion(null);
    setEditingHabitacion(habitacion);
    setIsModalOpen(true);
  };

  const { total, totalPages, hasNextPage } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <>
      <PanelHeader
        title="Habitaciones"
        subtitle="Gestión y estado de habitaciones"
        action={<Button onClick={() => { setEditingHabitacion(null); setIsModalOpen(true); }}>+ Nueva Habitación</Button>}
      >
        <CrudToolbar
          searchValue={tipoSearch}
          onSearchChange={(v) => { setTipoSearch(v); changeTipo(v); }}
          searchPlaceholder="Filtrar por tipo (ej: suite, estándar...)"
          pageSizeValue={limit}
          onPageSizeChange={(v) => changeLimit(v)}
          pageSizeOptions={[12, 24, 48]}
          pageSizeSuffix="hab."
        />

        {loading ? (
          <div className="flex items-center justify-center py-16 text-text-muted text-sm">Cargando...</div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 text-danger text-sm">{error}</div>
        ) : habitaciones.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted mb-4">No hay habitaciones</p>
            <Button onClick={() => setIsModalOpen(true)}>+ Nueva Habitación</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 sm:px-6 pb-4">
              {habitaciones.map((habitacion) => (
                <RoomCard key={habitacion.id} room={habitacion} onClick={() => handleSelectHabitacion(habitacion)} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              hasNextPage={hasNextPage}
              onPageChange={goToPage}
              label={total === 0 ? "Sin resultados" : `${from}–${to} de ${total} habitación${total !== 1 ? "es" : ""}`}
            />
          </>
        )}
      </PanelHeader>

      <RoomModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingHabitacion(null); }} onSuccess={fetchHabitaciones} habitacion={editingHabitacion} />

      {selectedHabitacion && (
        <Modal isOpen={!!selectedHabitacion} onClose={() => setSelectedHabitacion(null)} title={`Habitación ${selectedHabitacion.nro_habitacion}`}>
          <div className="max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold", estadoHabitacionColors[obtenerEstadoHabitacion(selectedHabitacion.estado, fechasReserva)])}>
                {selectedHabitacion.nro_habitacion}
              </div>
              <div>
                <p className="text-2xl font-bold font-display">{selectedHabitacion.nro_habitacion}</p>
                <p className="text-text-muted text-sm">Piso {selectedHabitacion.piso} • {selectedHabitacion.tipo_habitacion?.nombre}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-paper-medium/20 rounded-xl p-3">
                <p className="text-text-muted text-xs">Estado físico</p>
                <span className={cn("inline-block px-2 py-0.5 text-xs font-semibold rounded-full mt-1", selectedHabitacion.estado ? "bg-success-bg text-success" : "bg-bg-tertiary text-text-muted")}>
                  {selectedHabitacion.estado ? "Disponible" : "No disponible"}
                </span>
              </div>
              <div className="bg-paper-medium/20 rounded-xl p-3">
                <p className="text-text-muted text-xs">Tipo</p>
                <p className="text-sm font-medium mt-1">{selectedHabitacion.tipo_habitacion?.nombre ?? "—"}</p>
              </div>
            </div>

            {/* Reservas vinculadas */}
            {fechasReserva.length > 0 && (
              <div>
                <p className="text-text-muted text-xs font-semibold uppercase tracking-wide mb-2">Reservas vinculadas</p>
                <div className="space-y-2">
                  {fechasReserva.map((r, i) => {
                    const colorMap: Record<string, string> = {
                      CONFIRMADA:  "bg-success-bg text-success border-success/20",
                      EN_CASA:     "bg-info-bg text-info border-info/20",
                      TENTATIVA:   "bg-warning-bg text-warning border-warning/20",
                      COMPLETADA:  "bg-accent-primary/10 text-accent-primary border-accent-primary/20",
                      CANCELADA:   "bg-danger-bg text-danger border-danger/20",
                      NO_LLEGO:    "bg-bg-tertiary text-text-muted border-border",
                    };
                    const labelMap: Record<string, string> = {
                      CONFIRMADA: "Confirmada", EN_CASA: "En Casa", TENTATIVA: "Tentativa",
                      COMPLETADA: "Completada", CANCELADA: "Cancelada", NO_LLEGO: "No Llegó",
                    };
                    const color = colorMap[r.estado] ?? "bg-bg-tertiary text-text-muted border-border/50";
                    return (
                      <div key={i} className={cn("flex items-center justify-between rounded-xl px-3 py-2.5 border text-xs", color)}>
                        <span className="font-medium">
                          {formatUTCDate(r.fecha_inicio)}
                          {" → "}
                          {formatUTCDate(r.fecha_fin)}
                        </span>
                        <span className="font-semibold uppercase tracking-wide">{labelMap[r.estado] ?? r.estado}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {loadingFechas && (
              <p className="text-xs text-text-muted text-center py-2">Cargando reservas...</p>
            )}

            {/* Muebles */}
            {muebles.length > 0 && (
              <div>
                <p className="text-text-muted text-xs font-semibold uppercase tracking-wide mb-2">
                  Muebles ({muebles.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {muebles.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 bg-paper-medium/10 rounded-xl px-3 py-2.5">
                      {m.url_imagen ? (
                        <img src={m.url_imagen} alt={m.nombre} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-bg-tertiary/50 flex items-center justify-center shrink-0 text-text-muted text-xs font-bold">
                          {m.codigo.slice(0, 3)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{m.nombre}</p>
                        <p className="text-xs text-text-muted">{m.categoria?.nombre ?? "—"} · {m.condicion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedHabitacion.descripcion && (
              <div className="bg-paper-medium/10 rounded-xl p-3">
                <p className="text-text-muted text-xs">Descripción</p>
                <p className="text-sm mt-1">{selectedHabitacion.descripcion}</p>
              </div>
            )}

            {/* Promociones */}
            {selectedHabitacion.promociones && selectedHabitacion.promociones.length > 0 && (
              <div className="bg-paper-medium/10 rounded-xl p-3">
                <p className="text-text-muted text-xs font-semibold uppercase tracking-wide mb-2">
                  Promociones ({selectedHabitacion.promociones.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedHabitacion.promociones.map((id) => {
                    const promo = promociones.find((p) => p.id === id);
                    return (
                      <span key={id} className="text-xs font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                        {promo ? promo.codigo : id.slice(0, 8) + "…"}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Calendario de disponibilidad */}
            <div className="bg-paper-medium/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setCalendarOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-paper-medium/20 transition-colors"
              >
                <p className="text-text-muted text-xs font-semibold uppercase tracking-wide">Disponibilidad</p>
                <span className="text-text-muted text-xs">{calendarOpen ? "▲ Ocultar" : "▼ Ver calendario"}</span>
              </button>
              {calendarOpen && (
                <div className="px-4 pb-4">
                  {loadingFechas ? (
                    <p className="text-xs text-text-muted text-center py-4">Cargando fechas...</p>
                  ) : (
                    <RoomCalendar fechasReserva={fechasReserva} />
                  )}
                </div>
              )}
            </div>

            {selectedHabitacion.url_imagen && selectedHabitacion.url_imagen.length > 0 && (
              <div>
                <p className="text-text-muted text-xs mb-2">Imágenes ({selectedHabitacion.url_imagen.length})</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {selectedHabitacion.url_imagen.map((url, i) => (
                    <button key={i} onClick={() => { setCarouselIndex(i); setCarouselOpen(true); }} className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-border hover:opacity-80 transition-opacity">
                      <img src={url} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button onClick={(e) => handleEdit(selectedHabitacion, e)} className="flex-1">Editar</Button>
              <Button onClick={() => setDeleteOpen(true)} variant="danger" className="flex-1" disabled={deleting}>{deleting ? "Eliminando..." : "Eliminar"}</Button>
              <Button onClick={() => setSelectedHabitacion(null)} variant="secondary" className="flex-1">Cerrar</Button>
            </div>
          </div>
          </div>
        </Modal>
      )}

      {selectedHabitacion && (
        <ImageCarousel images={selectedHabitacion.url_imagen ?? []} isOpen={carouselOpen} onClose={() => setCarouselOpen(false)} initialIndex={carouselIndex} />
      )}

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Eliminar habitación"
        description={
          selectedHabitacion ? `¿Eliminar la habitación ${selectedHabitacion.nro_habitacion}?` : undefined
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        isConfirmLoading={deleting}
        onConfirm={async () => {
          setDeleteOpen(false);
          await handleDelete();
        }}
      />
    </>
  );
}

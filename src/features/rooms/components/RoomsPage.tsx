import { useState } from "react";
import { useHabitaciones } from "../hooks/useRooms";
import { RoomCard } from "./RoomCard";
import { RoomModal } from "./RoomModal";
import { ImageCarousel } from "./ImageCarousel";
import { PanelHeader, Button, Modal } from "@/components";
import { cn } from "@/utils/cn";
import { sileo } from "sileo";
import { isHandledError } from "@/utils/error.utils";
import { MdSearch } from "react-icons/md";
import type { Habitacion } from "../types";

export default function RoomsPage() {
  const {
    habitaciones, pagination, page, limit, loading, error,
    fetchHabitaciones, goToPage, changeLimit, changeTipo,
    deleteHabitacion,
  } = useHabitaciones();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHabitacion, setSelectedHabitacion] = useState<Habitacion | null>(null);
  const [editingHabitacion, setEditingHabitacion] = useState<Habitacion | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [tipoSearch, setTipoSearch] = useState("");

  const handleDelete = async () => {
    if (!selectedHabitacion) return;
    const confirmed = window.confirm(`¿Eliminar la habitación ${selectedHabitacion.nro_habitacion}?`);
    if (!confirmed) return;
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

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
      acc.push(p); return acc;
    }, []);

  return (
    <>
      <PanelHeader
        title="Habitaciones"
        subtitle="Gestión y estado de habitaciones"
        action={<Button onClick={() => { setEditingHabitacion(null); setIsModalOpen(true); }}>+ Nueva Habitación</Button>}
      >
        {/* Toolbar */}
        <div className="px-4 sm:px-6 pt-4 pb-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={tipoSearch}
              onChange={(e) => { setTipoSearch(e.target.value); changeTipo(e.target.value); }}
              placeholder="Filtrar por tipo (ej: suite, estándar...)"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-text-muted hidden sm:block">Mostrar</span>
            <select value={limit} onChange={(e) => changeLimit(Number(e.target.value))} className="text-sm rounded-xl border border-border bg-bg-card text-text-primary px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30">
              {[6, 12, 24, 48].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="text-xs text-text-muted hidden sm:block">hab.</span>
          </div>
        </div>

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
                <RoomCard key={habitacion.id} room={habitacion} onClick={() => setSelectedHabitacion(habitacion)} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-xs text-text-muted px-4 sm:px-6 py-4 border-t border-border/50">
              <span>{total === 0 ? "Sin resultados" : `${from}–${to} de ${total} habitación${total !== 1 ? "es" : ""}`}</span>
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

      <RoomModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingHabitacion(null); }} onSuccess={fetchHabitaciones} habitacion={editingHabitacion} />

      {selectedHabitacion && (
        <Modal isOpen={!!selectedHabitacion} onClose={() => setSelectedHabitacion(null)} title={`Habitación ${selectedHabitacion.nro_habitacion}`}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold", selectedHabitacion.estado ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                {selectedHabitacion.nro_habitacion}
              </div>
              <div>
                <p className="text-2xl font-bold font-playfair">{selectedHabitacion.nro_habitacion}</p>
                <p className="text-text-muted text-sm">Piso {selectedHabitacion.piso} • {selectedHabitacion.tipo_habitacion?.nombre}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-paper-medium/20 rounded-xl p-3">
                <p className="text-text-muted text-xs">Estado</p>
                <span className={cn("inline-block px-3 py-1 text-sm font-semibold rounded-full mt-1", selectedHabitacion.estado ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                  {selectedHabitacion.estado ? "Disponible" : "No disponible"}
                </span>
              </div>
              <div className="bg-paper-medium/20 rounded-xl p-3">
                <p className="text-text-muted text-xs">Tipo</p>
                <p className="text-sm font-medium mt-1">{selectedHabitacion.tipo_habitacion?.nombre ?? "—"}</p>
              </div>
            </div>

            {selectedHabitacion.descripcion && (
              <div className="bg-paper-medium/10 rounded-xl p-3">
                <p className="text-text-muted text-xs">Descripción</p>
                <p className="text-sm mt-1">{selectedHabitacion.descripcion}</p>
              </div>
            )}

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
              <Button onClick={handleDelete} variant="danger" className="flex-1" disabled={deleting}>{deleting ? "Eliminando..." : "Eliminar"}</Button>
              <Button onClick={() => setSelectedHabitacion(null)} variant="secondary" className="flex-1">Cerrar</Button>
            </div>
          </div>
        </Modal>
      )}

      {selectedHabitacion && (
        <ImageCarousel images={selectedHabitacion.url_imagen ?? []} isOpen={carouselOpen} onClose={() => setCarouselOpen(false)} initialIndex={carouselIndex} />
      )}
    </>
  );
}

import { useState } from "react";
import { useHabitaciones } from "../hooks/useRooms";
import { RoomCard, STATUS_LABELS } from "./RoomCard";
import { RoomModal } from "./RoomModal";
import { PanelHeader, Button, Modal } from "@/components";
import { cn } from "@/utils/cn";
import { sileo } from "sileo";
import { isHandledError } from "@/utils/error.utils";
import type { Habitacion } from "../types";

export default function RoomsPage() {
  const { habitaciones, loading, error, fetchHabitaciones, deleteHabitacion } = useHabitaciones();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHabitacion, setSelectedHabitacion] = useState<Habitacion | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingHabitacion, setEditingHabitacion] = useState<Habitacion | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>("");
  const formatearFecha = (fecha: string) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleDateString("es-PE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const handleDelete = async () => {
    if (!selectedHabitacion) return;
    
    const confirmed = window.confirm(`¿Estás seguro de eliminar la habitación ${selectedHabitacion.nro_habitacion}?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteHabitacion(selectedHabitacion.id);
      setSelectedHabitacion(null);
    } catch (err) {
      if (!isHandledError(err)) { sileo.error({ title: "Error", description: "No se pudo eliminar la habitación. Puede estar en uso." }); }
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (habitacion: Habitacion, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedHabitacion(null);  
    setEditingHabitacion(habitacion); 
    setIsModalOpen(true);
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div>Cargando...</div></div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div>{error}</div></div>;
  }

  return (
    <>
      <PanelHeader
        title="Habitaciones"
        subtitle="Gestión y estado de habitaciones"
        action={<Button onClick={() => setIsModalOpen(true)}>+ Nueva Habitación</Button>}
      >
        {habitaciones.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted mb-4">No hay habitaciones</p>
            <Button onClick={() => setIsModalOpen(true)}>+ Nueva Habitación</Button>
          </div>
        ) : (
          <>
            {/* Filtros de estado */}
            <div className="px-4 sm:px-6 pt-4 pb-3 flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterEstado("")}
                className={cn("text-xs px-3 py-1.5 rounded-xl border transition-all", filterEstado === "" ? "bg-primary text-white border-primary" : "border-border text-text-muted hover:border-primary/50")}
              >
                Todas
              </button>
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <button
                  key={status}
                  onClick={() => setFilterEstado(status)}
                  className={cn("text-xs px-3 py-1.5 rounded-xl border transition-all", filterEstado === status ? "bg-primary text-white border-primary" : "border-border text-text-muted hover:border-primary/50")}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 sm:px-6 pb-6">
              {habitaciones
                .filter((h) => !filterEstado || h.estado === filterEstado)
                .map((habitacion) => (
                <RoomCard
                  key={habitacion.id}
                  room={habitacion}
                  onClick={() => setSelectedHabitacion(habitacion)}
                />
              ))}
            </div>
            <div className="px-6 py-4 border-t border-border-light/30 flex gap-4 sm:gap-6 flex-wrap">
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <div key={status} className="flex items-center gap-2 text-xs">
                  <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", {
                    "bg-emerald-500": status === "DISPONIBLE",
                    "bg-red-500": status === "OCUPADA",
                    "bg-indigo-500": status === "RESERVADA",
                    "bg-orange-500": status === "LIMPIEZA",
                    "bg-amber-500": status === "MANTENIMIENTO",
                  })} />
                  <span className="text-text-muted font-medium">{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </PanelHeader>

      <RoomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchHabitaciones} />
      <RoomModal
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabitacion(null);
        }} 
        onSuccess={fetchHabitaciones}
        habitacion={editingHabitacion}
      />
      
      {selectedHabitacion && (
        <Modal isOpen={!!selectedHabitacion} onClose={() => setSelectedHabitacion(null)} title={`Habitación ${selectedHabitacion.nro_habitacion}`}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold",
                selectedHabitacion.estado === "DISPONIBLE" ? "bg-emerald-100 text-emerald-700" :
                selectedHabitacion.estado === "OCUPADA" ? "bg-red-100 text-red-700" :
                selectedHabitacion.estado === "RESERVADA" ? "bg-indigo-100 text-indigo-700" :
                selectedHabitacion.estado === "LIMPIEZA" ? "bg-orange-100 text-orange-700" :
                "bg-amber-100 text-amber-700"
              )}>
                {selectedHabitacion.nro_habitacion}
              </div>
              <div>
                <p className="text-2xl font-bold font-playfair">{selectedHabitacion.nro_habitacion}</p>
                <p className="text-text-muted text-sm">Piso {selectedHabitacion.piso} • {selectedHabitacion.tipo?.nombre}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-paper-medium/20 rounded-xl p-3">
                <p className="text-text-muted text-xs">Estado</p>
                <span className={cn(
                  "inline-block px-3 py-1 text-sm font-semibold rounded-full mt-1",
                  selectedHabitacion.estado === "DISPONIBLE" ? "bg-emerald-100 text-emerald-700" :
                  selectedHabitacion.estado === "OCUPADA" ? "bg-red-100 text-red-700" :
                  selectedHabitacion.estado === "RESERVADA" ? "bg-indigo-100 text-indigo-700" :
                  selectedHabitacion.estado === "LIMPIEZA" ? "bg-orange-100 text-orange-700" :
                  "bg-amber-100 text-amber-700"
                )}>
                  {STATUS_LABELS[selectedHabitacion.estado]}
                </span>
              </div>
              <div className="bg-paper-medium/20 rounded-xl p-3">
                <p className="text-text-muted text-xs">Utima Limpieza</p>
                <span className="px-2.5 py-1 text-xs">
                  {formatearFecha(selectedHabitacion.ulti_limpieza)}
                </span>
              </div>
            </div>

            {selectedHabitacion.notas && (
              <div className="bg-paper-medium/10 rounded-xl p-3">
                <p className="text-text-muted text-xs">Notas</p>
                <p className="text-sm mt-1">{selectedHabitacion.notas}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button onClick={(e) => handleEdit(selectedHabitacion, e)} className="flex-1">
                Editar
              </Button>
              <Button onClick={handleDelete} variant="danger" className="flex-1" disabled={deleting}>
                {deleting ? "Eliminando..." : "Eliminar"}
              </Button>
              <Button onClick={() => setSelectedHabitacion(null)} variant="secondary" className="flex-1">
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

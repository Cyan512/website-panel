import { useState } from "react";
import { useHabitaciones } from "../hooks/useRooms";
import { RoomCard, STATUS_LABELS } from "./RoomCard";
import { RoomModal } from "./RoomModal";
import { PanelHeader, Button, Modal } from "@/components";
import { cn } from "@/utils/cn";
import { sileo } from "sileo";
import type { Habitacion } from "../types";

export default function RoomsPage() {
  const { habitaciones, loading, error, fetchHabitaciones, deleteHabitacion } = useHabitaciones();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHabitacion, setSelectedHabitacion] = useState<Habitacion | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedHabitacion) return;
    
    const confirmed = window.confirm(`¿Estás seguro de eliminar la habitación ${selectedHabitacion.nro_habitacion}?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteHabitacion(selectedHabitacion.id);
      setSelectedHabitacion(null);
    } catch {
      sileo.error({ title: "Error", description: "No se pudo eliminar la habitación. Puede estar en uso." });
    } finally {
      setDeleting(false);
    }
  };

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 sm:p-6">
              {habitaciones.map((habitacion) => (
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
                <p className="text-text-muted text-xs">Limpieza</p>
                <span className={cn(
                  "inline-block px-3 py-1 text-sm font-semibold rounded-full mt-1",
                  selectedHabitacion.limpieza === "LIMPIA" ? "bg-emerald-100 text-emerald-700" :
                  selectedHabitacion.limpieza === "SUCIA" ? "bg-red-100 text-red-700" :
                  selectedHabitacion.limpieza === "EN_LIMPIEZA" ? "bg-orange-100 text-orange-700" :
                  "bg-blue-100 text-blue-700"
                )}>
                  {selectedHabitacion.limpieza === "LIMPIA" ? "Limpia" :
                   selectedHabitacion.limpieza === "SUCIA" ? "Sucia" :
                   selectedHabitacion.limpieza === "EN_LIMPIEZA" ? "En Limpieza" : "Inspección"}
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

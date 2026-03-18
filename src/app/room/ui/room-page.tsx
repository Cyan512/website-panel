import { useEffect, useState } from "react";
import { authClient } from "@/config/authClient";
import { getHabitacionesService } from "@/app/room/app/services/get-habitaciones.service";
import { getHabitacionService } from "@/app/room/app/services/get-habitacion.service";
import { deleteHabitacionService } from "@/app/room/app/services/delete-habitacion.service";
import type { Habitacion } from "@/app/room/dom/Habitacion";
import { RoomCard, STATUS_LABELS } from "@/app/room/ui/room-card";
import { RoomModal } from "./room-modal";
import PanelHeader from "@/app/shared/components/panel-header";
import { Button, Modal, Loading, EmptyState, Badge, Card, CardBody, Spinner } from "@/app/shared/components/ui";
import { cn } from "@/utils/cn";

export default function RoomPage() {
  const { data: session } = authClient.useSession();
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHabitacion, setSelectedHabitacion] =
    useState<Habitacion | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchHabitaciones = async () => {
    try {
      const data = await getHabitacionesService.execute();
      const rooms = Array.isArray(data)
        ? data
        : Array.isArray((data as { data?: Habitacion[] }).data)
          ? (data as { data: Habitacion[] }).data
          : [];
      setHabitaciones(rooms);
    } catch (error) {
      console.error("Error fetching habitaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHabitacionById = async (id: string) => {
    setLoadingDetail(true);
    try {
      const response = await getHabitacionService.execute(id);
      const habitacion = 'data' in response ? (response as { data: Habitacion }).data : response;
      setSelectedHabitacion(habitacion);
    } catch (error) {
      console.error("Error fetching habitacion:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedHabitacion) return;
    
    const confirmed = window.confirm(`¿Estás seguro de eliminar la habitación ${selectedHabitacion.nro_habitacion}?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteHabitacionService.execute(selectedHabitacion.id);
      setSelectedHabitacion(null);
      fetchHabitaciones();
    } catch (error) {
      console.error("Error deleting habitacion:", error);
      alert("No se pudo eliminar la habitación. Puede estar en uso.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchHabitaciones();
    }
  }, [session]);

  const handleAddRoom = () => {
    setIsModalOpen(true);
  };

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-paper-medium/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-text-muted font-lora">Por favor, inicia sesión para ver las habitaciones</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading text="Cargando habitaciones..." />;
  }

  if (habitaciones.length === 0) {
    return (
      <>
        <PanelHeader
          title="Habitaciones"
          subtitle="Gestión de habitaciones del hotel"
          action={
            <Button onClick={handleAddRoom}>+ Nueva Habitación</Button>
          }
        >
          <EmptyState
            title="No hay habitaciones"
            description="Comienza agregando la primera habitación del hotel"
            action={{
              label: "Agregar Habitación",
              onClick: handleAddRoom,
            }}
          />
        </PanelHeader>
        <RoomModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchHabitaciones}
        />
      </>
    );
  }

  return (
    <>
      <PanelHeader
        title="Habitaciones"
        subtitle="Gestión y estado de habitaciones"
        action={
          <Button onClick={handleAddRoom}>+ Nueva Habitación</Button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 sm:p-6">
          {habitaciones.map((habitacion) => (
            <RoomCard
              key={habitacion.id}
              room={habitacion}
              onClick={() => fetchHabitacionById(habitacion.id)}
            />
          ))}
        </div>
        <div className="px-6 py-4 border-t border-border-light/30 flex gap-4 sm:gap-6 flex-wrap">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div
              key={status}
              className="flex items-center gap-2 text-xs"
            >
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
      </PanelHeader>

      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchHabitaciones}
      />
      
      {selectedHabitacion && (
        <Modal
          isOpen={!!selectedHabitacion}
          onClose={() => setSelectedHabitacion(null)}
          title={`Habitación ${selectedHabitacion.nro_habitacion}`}
        >
          {loadingDetail ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="bg-paper-medium/20 border-0">
                <CardBody>
                  <div className="flex items-center gap-4 mb-4">
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
                      <p className="text-text-muted text-xs uppercase tracking-wider font-medium">Habitación</p>
                      <p className="text-2xl font-bold text-text-darkest font-playfair">
                        {selectedHabitacion.nro_habitacion}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium">Piso</p>
                      <p className="text-text-dark font-semibold">{selectedHabitacion.piso}</p>
                    </div>
                    <div>
                      <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium">Tipo</p>
                      <p className="text-text-dark font-semibold">{selectedHabitacion.tipo?.nombre || "-"}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-paper-medium/20 border-0">
                  <CardBody>
                    <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium mb-1">Estado</p>
                    <Badge
                      variant={
                        selectedHabitacion.estado === "DISPONIBLE" ? "success" :
                        selectedHabitacion.estado === "OCUPADA" ? "danger" :
                        selectedHabitacion.estado === "RESERVADA" ? "info" :
                        selectedHabitacion.estado === "LIMPIEZA" ? "warning" : "warning"
                      }
                    >
                      {STATUS_LABELS[selectedHabitacion.estado] || selectedHabitacion.estado}
                    </Badge>
                  </CardBody>
                </Card>
                <Card className="bg-paper-medium/20 border-0">
                  <CardBody>
                    <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium mb-1">Limpieza</p>
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                      selectedHabitacion.limpieza === "LIMPIA"
                        ? "bg-emerald-100 text-emerald-700"
                        : selectedHabitacion.limpieza === "SUCIA"
                          ? "bg-red-100 text-red-700"
                          : selectedHabitacion.limpieza === "EN_LIMPIEZA"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                    }`}>
                      {selectedHabitacion.limpieza === "LIMPIA" ? "Limpia" :
                       selectedHabitacion.limpieza === "SUCIA" ? "Sucia" :
                       selectedHabitacion.limpieza === "EN_LIMPIEZA" ? "En Limpieza" :
                       "Inspección"}
                    </span>
                  </CardBody>
                </Card>
              </div>

              {selectedHabitacion.notas && (
                <div className="bg-paper-medium/10 rounded-xl p-3 border border-border-light/20">
                  <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium mb-1">Notas</p>
                  <p className="text-text-dark text-sm">{selectedHabitacion.notas}</p>
                </div>
              )}

              <div className="bg-paper-medium/10 rounded-xl p-3 border border-border-light/20">
                <div className="flex justify-between text-xs">
                  <div>
                    <p className="text-text-muted">Creado</p>
                    <p className="text-text-secondary font-medium">
                      {new Date(selectedHabitacion.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-muted">Actualizado</p>
                    <p className="text-text-secondary font-medium">
                      {new Date(selectedHabitacion.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleDelete} variant="danger" className="flex-1" disabled={deleting}>
                  {deleting ? "Eliminando..." : "Eliminar"}
                </Button>
                <Button onClick={() => setSelectedHabitacion(null)} variant="secondary" className="flex-1">
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

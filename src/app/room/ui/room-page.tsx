import { useEffect, useState } from "react";
import { authClient } from "@/config/authClient";
import { getHabitacionesService } from "@/app/room/app/services/get-habitaciones.service";
import { getHabitacionService } from "@/app/room/app/services/get-habitacion.service";
import type { Habitacion } from "@/app/room/dom/Habitacion";
import { RoomCard, STATUS_COLORS } from "@/app/room/ui/room-card";
import { RoomModal } from "./room-modal";
import PanelHeader from "@/app/shared/components/panel-header";
import { cn } from "@/utils/cn";

export default function RoomPage() {
  const { data: session } = authClient.useSession();
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHabitacion, setSelectedHabitacion] =
    useState<Habitacion | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchHabitaciones = async () => {
    try {
      const data: any = await getHabitacionesService.execute();
      const rooms = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
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
      const response: any = await getHabitacionService.execute(id);
      const habitacion = response?.data ? response.data : response;
      console.log("Habitación obtenida:", habitacion);
      setSelectedHabitacion(habitacion);
    } catch (error) {
      console.error("Error fetching habitacion:", error);
    } finally {
      setLoadingDetail(false);
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
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-muted text-sm">Cargando habitaciones...</p>
        </div>
      </div>
    );
  }

  if (habitaciones.length === 0) {
    return (
      <PanelHeader
        title="Habitaciones"
        subtitle="Gestión de habitaciones del hotel"
        action={
          <button
            onClick={handleAddRoom}
            className="px-4 py-2.5 bg-gradient-to-r from-accent-primary to-accent-light text-paper-lightest text-sm font-medium rounded-xl shadow-lg shadow-accent-primary/30 hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            + Nueva Habitación
          </button>
        }
      >
        <div className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-paper-medium/50 flex items-center justify-center">
            <svg className="w-10 h-10 text-text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-dark mb-1">No hay habitaciones</h3>
          <p className="text-text-muted text-sm mb-6">Comienza agregando la primera habitación del hotel</p>
          <button
            onClick={handleAddRoom}
            className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-light text-paper-lightest font-medium rounded-xl shadow-lg shadow-accent-primary/30 hover:shadow-xl hover:scale-105 transition-all duration-200 inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Habitación
          </button>
        </div>
        <RoomModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchHabitaciones}
        />
      </PanelHeader>
    );
  }

  return (
    <>
      <PanelHeader
        title="Habitaciones"
        subtitle="Gestión y estado de habitaciones"
        action={
          <button
            onClick={handleAddRoom}
            className="px-4 py-2.5 bg-gradient-to-r from-accent-primary to-accent-light text-paper-lightest text-sm font-medium rounded-xl shadow-lg shadow-accent-primary/30 hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            + Nueva Habitación
          </button>
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
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div
              key={status}
              className="flex items-center gap-2 text-xs"
            >
              <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", color)} />
              <span className="text-text-muted font-medium">{status}</span>
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
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedHabitacion(null)}
        >
          <div
            className="bg-paper-lightest rounded-2xl w-full max-w-md border border-border-light/50 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-accent-primary to-accent-light px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-paper-lightest font-playfair">
                  Habitación {selectedHabitacion.numero}
                </h2>
                <button
                  onClick={() => setSelectedHabitacion(null)}
                  className="p-1.5 rounded-lg bg-paper-lightest/20 hover:bg-paper-lightest/30 text-paper-lightest transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {loadingDetail ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-3 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                <div className="bg-paper-medium/20 rounded-xl p-4 border border-border-light/30">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold",
                      selectedHabitacion.estado === "Disponible" ? "bg-emerald-100 text-emerald-700" :
                      selectedHabitacion.estado === "Ocupado" ? "bg-red-100 text-red-700" :
                      selectedHabitacion.estado === "Reservado" ? "bg-indigo-100 text-indigo-700" :
                      "bg-amber-100 text-amber-700"
                    )}>
                      {selectedHabitacion.numero}
                    </div>
                    <div>
                      <p className="text-text-muted text-xs uppercase tracking-wider font-medium">Habitación</p>
                      <p className="text-2xl font-bold text-text-darkest font-playfair">
                        {selectedHabitacion.numero}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium">Piso</p>
                      <p className="text-text-dark font-semibold">
                        {selectedHabitacion.piso}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium">Tipo</p>
                      <p className="text-text-dark font-semibold">
                        {selectedHabitacion.tipo}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-paper-medium/20 rounded-xl p-4 border border-border-light/30">
                    <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium mb-1">
                      Precio
                    </p>
                    <p className="text-2xl font-bold text-accent-primary">
                      S/{selectedHabitacion.precio || 0}
                      <span className="text-xs font-normal text-text-muted">
                        /noche
                      </span>
                    </p>
                  </div>
                  <div className="bg-paper-medium/20 rounded-xl p-4 border border-border-light/30">
                    <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium mb-1">
                      Estado
                    </p>
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                        selectedHabitacion.estado === "Disponible"
                          ? "bg-emerald-100 text-emerald-700"
                          : selectedHabitacion.estado === "Ocupado"
                            ? "bg-red-100 text-red-700"
                            : selectedHabitacion.estado === "Reservado"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {selectedHabitacion.estado}
                    </span>
                  </div>
                </div>

                <div className="bg-paper-medium/10 rounded-xl p-3 border border-border-light/20">
                  <div className="flex justify-between text-xs">
                    <div>
                      <p className="text-text-muted">Creado</p>
                      <p className="text-text-secondary font-medium">
                        {new Date(selectedHabitacion.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-text-muted">Actualizado</p>
                      <p className="text-text-secondary font-medium">
                        {new Date(selectedHabitacion.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedHabitacion(null)}
                  className="w-full py-3 bg-paper-medium/30 text-text-dark font-medium rounded-xl hover:bg-paper-medium/50 transition-all border border-border-light/30"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

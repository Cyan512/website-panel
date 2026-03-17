import { useEffect, useState } from "react";
import { authClient } from "@/config/authClient";
import { getHabitacionesService } from "@/app/room/app/services/get-habitaciones.service";
import { getHabitacionService } from "@/app/room/app/services/get-habitacion.service";
import type { Habitacion } from "@/app/room/dom/Habitacion";
import { RoomCard } from "@/app/room/ui/room-card";
import { RoomModal } from "./room-modal";

export default function RoomPage() {
  const { data: session } = authClient.useSession();
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHabitacion, setSelectedHabitacion] = useState<Habitacion | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchHabitaciones = async () => {
    try {
      const data: any = await getHabitacionesService.execute();
      const rooms = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
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

  if (!session) {
    return <div>Por favor, inicia sesión para ver las habitaciones</div>;
  }

  if (loading) {
    return <div>Cargando habitaciones...</div>;
  }

  if (habitaciones.length === 0) {
    return (
      <div>
        <h1>Habitaciones</h1>
        <button onClick={() => setIsModalOpen(true)}>Nueva Habitación</button>
        <p>No hay habitaciones disponibles</p>
        <RoomModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchHabitaciones}
        />
      </div>
    );
  }

  return (
    <div>
      <div>
        <div>
          <div></div>
          <div></div>
        </div>
        <div>
          <select>
            <option value="">Todos los estados</option>
            <option>Libre</option>
            <option>Ocupado</option>
            <option>Reservado</option>
            <option>Limpieza</option>
          </select>
          <button onClick={() => setIsModalOpen(true)}>
            agregar room
          </button>
        </div>
      </div>
      <div>
        {habitaciones.map((habitacion) => (
          <RoomCard 
            key={habitacion.id} 
            room={habitacion} 
            onClick={() => fetchHabitacionById(habitacion.id)}
          />
        ))}
      </div>
      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchHabitaciones}
      />
      {selectedHabitacion && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedHabitacion(null)}
        >
          <div 
            className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-6 w-full max-w-md border border-stone-700/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-stone-100">Detalle de Habitación</h2>
              <button 
                onClick={() => setSelectedHabitacion(null)}
                className="text-stone-400 hover:text-stone-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {loadingDetail ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center">
                      <svg className="w-5 h-5 text-stone-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-stone-400 text-xs uppercase tracking-wider">Número</p>
                      <p className="text-xl font-bold text-stone-100">{selectedHabitacion.numero}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-stone-500 text-xs uppercase">Piso</p>
                      <p className="text-stone-200 font-medium">{selectedHabitacion.piso}</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-xs uppercase">Tipo</p>
                      <p className="text-stone-200 font-medium">{selectedHabitacion.tipo}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700/50">
                    <p className="text-stone-500 text-xs uppercase mb-1">Precio</p>
                    <p className="text-2xl font-bold text-amber-500">
                      S/{selectedHabitacion.precio || 0}
                      <span className="text-sm font-normal text-stone-500">/noche</span>
                    </p>
                  </div>
                  <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700/50">
                    <p className="text-stone-500 text-xs uppercase mb-1">Estado</p>
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${
                      selectedHabitacion.estado === 'Disponible' ? 'bg-emerald-700/20 text-emerald-400 border-emerald-700/30' :
                      selectedHabitacion.estado === 'Ocupado' ? 'bg-amber-700/20 text-amber-400 border-amber-700/30' :
                      selectedHabitacion.estado === 'Reservado' ? 'bg-indigo-700/20 text-indigo-400 border-indigo-700/30' :
                      'bg-stone-600/20 text-stone-400 border-stone-600/30'
                    }`}>
                      {selectedHabitacion.estado}
                    </span>
                  </div>
                </div>

                <div className="bg-stone-800/30 rounded-xl p-3 border border-stone-700/30">
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-stone-500">Creado</p>
                      <p className="text-stone-300">{new Date(selectedHabitacion.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-stone-500">Actualizado</p>
                      <p className="text-stone-300">{new Date(selectedHabitacion.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedHabitacion(null)}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-amber-600 to-orange-700 text-stone-100 font-medium rounded-xl hover:from-amber-500 hover:to-orange-600 transition-all"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

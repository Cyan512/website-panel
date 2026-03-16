import { useEffect, useState } from "react";
import { authClient } from "@/config/authClient";
import { roomService } from "../room.service";
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
      const data: any = await roomService.getAll();
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
      const habitacion = await roomService.getById(id);
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
        <div className="modal-overlay" onClick={() => setSelectedHabitacion(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Detalle de Habitación</h2>
            {loadingDetail ? (
              <p>Cargando...</p>
            ) : (
              <>
                <p><strong>Número:</strong> {selectedHabitacion.numero}</p>
                <p><strong>Piso:</strong> {selectedHabitacion.piso}</p>
                <p><strong>Tipo:</strong> {selectedHabitacion.tipo}</p>
                <p><strong>Precio:</strong> {selectedHabitacion.precio}</p>
                <p><strong>Estado:</strong> {selectedHabitacion.estado}</p>
                <p><strong>Creado:</strong> {new Date(selectedHabitacion.createdAt).toLocaleDateString()}</p>
                <p><strong>Actualizado:</strong> {new Date(selectedHabitacion.updatedAt).toLocaleDateString()}</p>
              </>
            )}
            <button onClick={() => setSelectedHabitacion(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

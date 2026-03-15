import { useEffect, useState } from "react";
import { authClient } from "@/config/authClient";
import { roomService } from "../room.service";
import type { Habitacion } from "@/models/Habitacion";
import { RoomCard } from "@/app/room/ui/room-card";
import { RoomModal } from "./room-modal";

export default function RoomPage() {
  const { data: session } = authClient.useSession();
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          <RoomCard key={habitacion.id} room={habitacion} />
        ))}
      </div>
      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchHabitaciones}
      />
    </div>
  );
}

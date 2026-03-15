"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/config/authClient";
import { roomService } from "../room.service";
import type { Habitacion } from "@/models/Habitacion";
import { RoomCard } from "@/app/room/ui/room-card";

export default function RoomPage() {
  const { data: session } = authClient.useSession();
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHabitaciones = async () => {
      try {
        const data: any = await roomService.getAll();
        console.log("Response:", data);
        const rooms = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        console.log("Habitaciones:", rooms);
        setHabitaciones(rooms);
      } catch (error) {
        console.error("Error fetching habitaciones:", error);
      } finally {
        setLoading(false);
      }
    };

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
        <p>No hay habitaciones disponibles</p>
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
          <button>

          </button>
        </div>
      </div>
      <div>
        {habitaciones.map((habitacion) => (
          <RoomCard room={habitacion} />
        ))}
      </div>
    </div>
  );
}

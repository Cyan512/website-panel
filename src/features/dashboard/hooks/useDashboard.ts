import { useState, useEffect } from "react";
import { authClient } from "@/config/authClient";
import { roomsApi, tiposHabitacionApi } from "@/features/rooms/api";
import { inventoryApi } from "@/features/inventory/api";
import type { Habitacion } from "@/features/rooms/types";

export interface DashboardStats {
  totalHabitaciones: number;
  disponibles: number;
  ocupadas: number;
  reservas: number;
  mantenimiento: number;
  totalInventario: number;
  totalTipos: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  type: "success" | "warning" | "info";
  time: Date;
  habitacion?: string;
}

export function useDashboard() {
  const { data: session } = authClient.useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalHabitaciones: 0,
    disponibles: 0,
    ocupadas: 0,
    reservas: 0,
    mantenimiento: 0,
    totalInventario: 0,
    totalTipos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  const fetchStats = async () => {
    if (!session) return;

    setLoading(true);
    setError(null);

    try {
      const [habitaciones, tipos, inventario] = await Promise.all([
        roomsApi.getAll().catch(() => [] as Habitacion[]),
        tiposHabitacionApi.getAll().catch(() => []),
        inventoryApi.getAll().catch(() => []),
      ]);

      const disponibles = habitaciones.filter((h) => h.estado === "DISPONIBLE").length;
      const ocupadas = habitaciones.filter((h) => h.estado === "OCUPADA").length;
      const reservas = habitaciones.filter((h) => h.estado === "RESERVADA").length;
      const mantenimiento = habitaciones.filter((h) => h.estado === "MANTENIMIENTO" || h.estado === "LIMPIEZA").length;

      setStats({
        totalHabitaciones: habitaciones.length,
        disponibles,
        ocupadas,
        reservas,
        mantenimiento,
        totalInventario: inventario.length,
        totalTipos: tipos.length,
      });

      const recentActivities: RecentActivity[] = [];

      habitaciones.forEach((h) => {
        if (h.updated_at) {
          const date = new Date(h.updated_at);
          const now = new Date();
          const diffMs = now.getTime() - date.getTime();
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

          let action = "";
          let type: "success" | "warning" | "info" = "info";

          switch (h.estado) {
            case "OCUPADA":
              action = `Check-in - Habitación ${h.nro_habitacion}`;
              type = "success";
              break;
            case "DISPONIBLE":
              action = `Check-out - Habitación ${h.nro_habitacion}`;
              type = "info";
              break;
            case "LIMPIEZA":
              action = `Limpieza - Habitación ${h.nro_habitacion}`;
              type = "warning";
              break;
            case "MANTENIMIENTO":
              action = `Mantenimiento - Habitación ${h.nro_habitacion}`;
              type = "warning";
              break;
            default:
              return;
          }

          if (diffHours <= 24) {
            recentActivities.push({
              id: `${h.id}-${h.estado}`,
              action,
              type,
              time: date,
              habitacion: h.nro_habitacion,
            });
          }
        }
      });

      recentActivities.sort((a, b) => b.time.getTime() - a.time.getTime());
      setActivities(recentActivities.slice(0, 5));

    } catch {
      setError("Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchStats();
    }
  }, [session]);

  return { stats, loading, error, activities, refetch: fetchStats };
}

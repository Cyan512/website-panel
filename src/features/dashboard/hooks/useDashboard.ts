import { useState, useEffect } from "react";
import { authClient } from "@/shared/lib/auth";
import { roomsApi } from "@/features/rooms/api";
import { reservasApi } from "@/features/reservations/api";
import { pagosApi } from "@/features/payments/api";

export interface DashboardStats {
  // Cards
  totalHabitaciones: number;
  ocupadasHoy: number;
  porcentajeOcupacionHoy: number;
  porcentajeOcupacionAyer: number;
  checkInHoy: number;
  checkOutHoy: number;
  ingresosMes: number;
  ingresosMesAnterior: number;
  moneda: string;
  // Estado habitaciones (para barras)
  disponibles: number;
  ocupadas: number;
  reservas: number;
  mantenimiento: number;
  totalInventario: number;
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
    ocupadasHoy: 0,
    porcentajeOcupacionHoy: 0,
    porcentajeOcupacionAyer: 0,
    checkInHoy: 0,
    checkOutHoy: 0,
    ingresosMes: 0,
    ingresosMesAnterior: 0,
    moneda: "S/",
    disponibles: 0,
    ocupadas: 0,
    reservas: 0,
    mantenimiento: 0,
    totalInventario: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  const fetchStats = async () => {
    if (!session) return;
    setLoading(true);
    setError(null);

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const mesAnterior = now.getMonth() === 0
      ? `${now.getFullYear() - 1}-12`
      : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`;

    try {
      const [habData, reservasData, pagosData] = await Promise.all([
        roomsApi.getAll(1, 100).catch(() => ({ list: [], pagination: { total: 0 } })),
        reservasApi.getAll(1, 100).catch(() => ({ list: [], pagination: { total: 0 } })),
        pagosApi.getAll().catch(() => []),
      ]);

      const habitaciones = habData.list;
      const reservas = reservasData.list;
      const pagos = Array.isArray(pagosData) ? pagosData : [];
      const total = habitaciones.length;

      // Ocupación hoy (estado === false = Ocupada)
      const ocupadasHoy = habitaciones.filter((h) => h.estado === false).length;
      const pctHoy = total > 0 ? Math.round((ocupadasHoy / total) * 100) : 0;

      // Ocupación ayer — reservas activas ayer
      const ocupadasAyer = reservas.filter(
        (r) => r.fecha_inicio <= yesterday && r.fecha_fin > yesterday &&
          r.estado !== "CANCELADA" && r.estado !== "NO_LLEGO"
      ).length;
      const pctAyer = total > 0 ? Math.round((ocupadasAyer / total) * 100) : 0;

      // Check-in hoy
      const checkInHoy = reservas.filter(
        (r) => r.fecha_inicio === today && (r.estado === "CONFIRMADA" || r.estado === "EN_CASA" || r.estado === "TENTATIVA")
      ).length;

      // Check-out hoy
      const checkOutHoy = reservas.filter(
        (r) => r.fecha_fin === today && (r.estado === "COMPLETADA" || r.estado === "EN_CASA")
      ).length;

      // Ingresos por mes
      const ingresosMes = pagos
        .filter((p) => p.estado === "CONFIRMADO" && p.fecha_pago?.startsWith(mesActual))
        .reduce((acc, p) => acc + parseFloat(p.monto || "0"), 0);
      const ingresosMesAnterior = pagos
        .filter((p) => p.estado === "CONFIRMADO" && p.fecha_pago?.startsWith(mesAnterior))
        .reduce((acc, p) => acc + parseFloat(p.monto || "0"), 0);

      // Estado habitaciones para barras
      const disponibles = habitaciones.filter((h) => h.estado === true).length;
      const reservadasCount = reservas.filter(
        (r) => r.fecha_inicio === today && r.estado === "CONFIRMADA"
      ).length;

      setStats({
        totalHabitaciones: total,
        ocupadasHoy,
        porcentajeOcupacionHoy: pctHoy,
        porcentajeOcupacionAyer: pctAyer,
        checkInHoy,
        checkOutHoy,
        ingresosMes,
        ingresosMesAnterior,
        moneda: pagos[0]?.moneda ?? "S/",
        disponibles,
        ocupadas: ocupadasHoy,
        reservas: reservadasCount,
        mantenimiento: 0,
        totalInventario: 0,
      });

      // Actividad reciente desde reservas
      const recentActivities: RecentActivity[] = reservas
        .filter((r) => {
          const updated = new Date(r.updated_at);
          return (Date.now() - updated.getTime()) < 24 * 60 * 60 * 1000;
        })
        .slice(0, 5)
        .map((r) => ({
          id: r.id,
          action: `${r.estado === "CONFIRMADA" ? "Reserva confirmada" : r.estado === "CANCELADA" ? "Reserva cancelada" : r.estado === "EN_CASA" ? "Check-in" : r.estado === "COMPLETADA" ? "Check-out" : r.estado} — ${r.nombre_huesped}`,
          type: r.estado === "CONFIRMADA" || r.estado === "EN_CASA" ? "success" : r.estado === "CANCELADA" ? "warning" : "info" as "success" | "warning" | "info",
          time: new Date(r.updated_at),
          habitacion: r.nro_habitacion,
        }));

      setActivities(recentActivities);
    } catch {
      setError("Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchStats();
  }, [session]);

  return { stats, loading, error, activities, refetch: fetchStats };
}

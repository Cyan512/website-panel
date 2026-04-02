import { authClient } from "@/config/authClient";
import { Card, CardBody, Loading } from "@/components";
import { MdHotel, MdLogin, MdLogout, MdAttachMoney, MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { useDashboard } from "../hooks/useDashboard";
import Ingresos from "./Ingresos";
import { cn } from "@/utils/cn";

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 1) return "Hace un momento";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  return date.toLocaleDateString();
}

export default function DashboardPage() {
  const { data: session } = authClient.useSession();
  const { stats, loading, activities } = useDashboard();

  if (loading) {
    console.log("Cargando estadísticas del dashboard...");
    return <Loading fullScreen />;
  }

  const now = new Date();
  const mesLabel = now.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const mesAnteriorLabel = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toLocaleDateString("es-ES", { month: "long" });
  const ingresoDelta = stats.ingresosMesAnterior > 0
    ? ((stats.ingresosMes - stats.ingresosMesAnterior) / stats.ingresosMesAnterior) * 100
    : 0;
  const fmt = (n: number) => n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const statsCards = [
    {
      label: "Ocupación hoy",
      icon: MdHotel,
      color: "from-blue-500 to-blue-600",
      main: `${stats.porcentajeOcupacionHoy}%`,
      sub: `${stats.ocupadasHoy} de ${stats.totalHabitaciones} hab. ocupadas`,
      extra: (
        <span className={cn("text-xs font-medium flex items-center gap-0.5", stats.porcentajeOcupacionHoy >= stats.porcentajeOcupacionAyer ? "text-emerald-600" : "text-red-500")}>
          {stats.porcentajeOcupacionHoy >= stats.porcentajeOcupacionAyer ? <MdTrendingUp className="w-3.5 h-3.5" /> : <MdTrendingDown className="w-3.5 h-3.5" />}
          Ayer: {stats.porcentajeOcupacionAyer}%
        </span>
      ),
    },
    {
      label: "Check-in hoy",
      icon: MdLogin,
      color: "from-emerald-500 to-emerald-600",
      main: String(stats.checkInHoy),
      sub: "Reservas confirmadas",
      extra: <span className="text-xs text-text-muted">Entradas programadas para hoy</span>,
    },
    {
      label: "Check-out hoy",
      icon: MdLogout,
      color: "from-amber-500 to-amber-600",
      main: String(stats.checkOutHoy),
      sub: "Salidas confirmadas",
      extra: <span className="text-xs text-text-muted">Estancias que finalizan hoy</span>,
    },
    {
      label: "Ingresos del mes",
      icon: MdAttachMoney,
      color: "from-violet-500 to-violet-600",
      main: `${stats.moneda} ${fmt(stats.ingresosMes)}`,
      sub: mesLabel,
      extra: (
        <span className={cn("text-xs font-medium flex items-center gap-0.5", ingresoDelta >= 0 ? "text-emerald-600" : "text-red-500")}>
          {ingresoDelta >= 0 ? <MdTrendingUp className="w-3.5 h-3.5" /> : <MdTrendingDown className="w-3.5 h-3.5" />}
          {mesAnteriorLabel}: {stats.moneda} {fmt(stats.ingresosMesAnterior)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Bienvenido, {session?.user?.name || "Usuario"}</h1>
        <p className="text-text-muted">Panel de administración del Hotel Kori</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} hoverable>
              <CardBody>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-text-muted font-medium">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-text-primary mb-0.5">{stat.main}</p>
                <p className="text-sm text-text-muted mb-3">{stat.sub}</p>
                <div className="pt-2 border-t border-border/50">{stat.extra}</div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardBody>
            <h3 className="font-semibold text-text-primary mb-4">Actividad Reciente</h3>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-4">Sin actividad reciente</p>
              ) : (
                activities.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary/50">
                    <div className={`w-2 h-2 rounded-full ${item.type === "success" ? "bg-emerald-500" : item.type === "warning" ? "bg-amber-500" : "bg-blue-500"}`} />
                    <div className="flex-1">
                      <p className="text-sm text-text-secondary">{item.action}</p>
                      <p className="text-xs text-text-muted">{formatTimeAgo(item.time)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="font-semibold text-text-primary mb-4">Estado de Habitaciones</h3>
            <div className="space-y-3">
              {[
                { label: "Disponibles", value: stats.disponibles, total: stats.totalHabitaciones, color: "bg-emerald-500" },
                { label: "Ocupadas", value: stats.ocupadas, total: stats.totalHabitaciones, color: "bg-red-500" },
                { label: "En Limpieza", value: stats.mantenimiento, total: stats.totalHabitaciones, color: "bg-amber-500" },
                { label: "Reservadas", value: stats.reservas, total: stats.totalHabitaciones, color: "bg-blue-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-text-muted">{item.label}</span>
                    <span className="font-medium text-text-secondary">{item.value}</span>
                  </div>
                  <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all`}
                      style={{ width: stats.totalHabitaciones > 0 ? `${(item.value / stats.totalHabitaciones) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
      <Card>
        <CardBody>
          <Ingresos />
        </CardBody>
      </Card>
    </div>
  );
}

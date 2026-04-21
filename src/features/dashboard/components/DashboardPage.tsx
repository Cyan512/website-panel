import { authClient } from "@/shared/lib/auth";
import { Card, CardBody, Loading } from "@/components";
import { MdHotel, MdLogin, MdLogout, MdAttachMoney, MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { useDashboard } from "../hooks/useDashboard";
import Ingresos from "./Ingresos";
import { cn } from "@/shared/utils/cn";

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
      color: "from-[#8B4513] to-[#A0522D]",
      accent: "#A0522D",
      main: `${stats.porcentajeOcupacionHoy}%`,
      sub: `${stats.ocupadasHoy} de ${stats.totalHabitaciones} hab. ocupadas`,
      extra: (
        <span className={cn("text-xs font-medium flex items-center gap-0.5 font-body", stats.porcentajeOcupacionHoy >= stats.porcentajeOcupacionAyer ? "text-success" : "text-danger")}>
          {stats.porcentajeOcupacionHoy >= stats.porcentajeOcupacionAyer ? <MdTrendingUp className="w-3.5 h-3.5" /> : <MdTrendingDown className="w-3.5 h-3.5" />}
          Ayer: {stats.porcentajeOcupacionAyer}%
        </span>
      ),
    },
    {
      label: "Check-in hoy",
      icon: MdLogin,
      color: "from-[#2e4e28] to-[#4a7840]",
      accent: "#4a7840",
      main: String(stats.checkInHoy),
      sub: "Reservas confirmadas",
      extra: <span className="text-xs text-text-muted font-body">Entradas programadas para hoy</span>,
    },
    {
      label: "Check-out hoy",
      icon: MdLogout,
      color: "from-[#b8892a] to-[#d4a83c]",
      accent: "#d4a83c",
      main: String(stats.checkOutHoy),
      sub: "Salidas confirmadas",
      extra: <span className="text-xs text-text-muted font-body">Estancias que finalizan hoy</span>,
    },
    {
      label: "Ingresos del mes",
      icon: MdAttachMoney,
      color: "from-[#9e2424] to-[#c23030]",
      accent: "#c23030",
      main: `${stats.moneda} ${fmt(stats.ingresosMes)}`,
      sub: mesLabel,
      extra: (
        <span className={cn("text-xs font-medium flex items-center gap-0.5 font-body", ingresoDelta >= 0 ? "text-success" : "text-danger")}>
          {ingresoDelta >= 0 ? <MdTrendingUp className="w-3.5 h-3.5" /> : <MdTrendingDown className="w-3.5 h-3.5" />}
          {mesAnteriorLabel}: {stats.moneda} {fmt(stats.ingresosMesAnterior)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-text-primary mb-2 font-display tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
          Bienvenido, {session?.user?.name || "Usuario"}
        </h1>
        <p className="text-text-muted text-base italic" style={{ fontFamily: 'var(--font-body)' }}>Panel de administración del Hotel Kori</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              hoverable
              className="animate-slide-up"
              style={{ animationDelay: `${idx * 120}ms` }}
            >
              <CardBody>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} shadow-sm`}>
                    <Icon className="w-5 h-5 text-white drop-shadow-sm" />
                  </div>
                  <span className="text-xs text-text-muted font-medium tracking-wider uppercase" style={{ fontFamily: 'var(--font-display)' }}>{stat.label}</span>
                </div>
                <p className="text-3xl font-bold text-text-primary mb-0.5 font-numeral">{stat.main}</p>
                <p className="text-sm text-text-muted mb-3" style={{ fontFamily: 'var(--font-body)' }}>{stat.sub}</p>
                <div className="pt-2 border-t border-border/40">{stat.extra}</div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-slide-up" style={{ animationDelay: '480ms' }}>
          <CardBody>
            <h3 className="font-semibold text-text-primary mb-4 tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>Actividad Reciente</h3>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-4 italic">Sin actividad reciente</p>
              ) : (
                activities.map((item, i) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-bg-tertiary/40 border border-border/20 transition-all duration-200 hover:bg-bg-tertiary/70 hover:border-border/40"
                    style={{ animationDelay: `${480 + i * 80}ms` }}
                  >
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full ring-2 ring-offset-1",
                      item.type === "success" ? "bg-success ring-success/20 ring-offset-bg-card" :
                      item.type === "warning" ? "bg-warning ring-warning/20 ring-offset-bg-card" :
                      "bg-info ring-info/20 ring-offset-bg-card"
                    )} />
                    <div className="flex-1">
                      <p className="text-sm text-text-secondary font-medium">{item.action}</p>
                      <p className="text-xs text-text-muted italic">{formatTimeAgo(item.time)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '600ms' }}>
          <CardBody>
            <h3 className="font-semibold text-text-primary mb-4 tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>Estado de Habitaciones</h3>
            <div className="space-y-4">
              {[
                { label: "Disponibles", value: stats.disponibles, total: stats.totalHabitaciones, color: "bg-success", gradient: "from-success/80 to-success" },
                { label: "Ocupadas", value: stats.ocupadas, total: stats.totalHabitaciones, color: "bg-danger", gradient: "from-danger/80 to-danger" },
                { label: "En Limpieza", value: stats.mantenimiento, total: stats.totalHabitaciones, color: "bg-warning", gradient: "from-warning/80 to-warning" },
                { label: "Reservadas", value: stats.reservas, total: stats.totalHabitaciones, color: "bg-info", gradient: "from-info/80 to-info" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-muted font-medium">{item.label}</span>
                    <span className="font-bold text-text-secondary font-numeral">{item.value}</span>
                  </div>
                  <div className="h-2 bg-bg-tertiary/60 rounded-full overflow-hidden ring-1 ring-border/20">
                    <div
                      className={`h-full bg-gradient-to-r ${item.gradient} rounded-full transition-all duration-700 ease-out`}
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

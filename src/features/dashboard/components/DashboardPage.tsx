import { authClient } from "@/config/authClient";
import { Card, CardBody, Loading } from "@/components";
import { MdHotel, MdPeople, MdEventNote, MdInventory } from "react-icons/md";
import { useDashboard } from "../hooks/useDashboard";
import Ingresos from "./Ingresos";

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

  const statsCards = [
    { label: "Habitaciones", value: stats.totalHabitaciones, icon: MdHotel, color: "from-emerald-400 to-emerald-500" },
    { label: "Reservas", value: stats.reservas, icon: MdEventNote, color: "from-blue-500 to-blue-600" },
    { label: "Huéspedes", value: stats.ocupadas, icon: MdPeople, color: "from-violet-500 to-violet-600" },
    { label: "Inventario", value: stats.totalInventario, icon: MdInventory, color: "from-amber-500 to-amber-600" },
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
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-text-muted">{stat.label}</p>
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

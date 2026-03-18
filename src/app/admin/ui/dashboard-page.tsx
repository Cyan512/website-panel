import { authClient } from "@/config/authClient";
import { Card, CardBody } from "@/app/shared/components/ui";
import { MdHotel, MdPeople, MdEventNote, MdInventory } from "react-icons/md";

const STATS = [
  { label: "Habitaciones", value: "24", icon: MdHotel, color: "from-emerald-500 to-emerald-600" },
  { label: "Reservas", value: "12", icon: MdEventNote, color: "from-blue-500 to-blue-600" },
  { label: "Huéspedes", value: "48", icon: MdPeople, color: "from-purple-500 to-purple-600" },
  { label: "Inventario", value: "156", icon: MdInventory, color: "from-amber-500 to-amber-600" },
];

export default function DashboardPage() {
  const { data: session } = authClient.useSession();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-playfair text-text-darkest mb-1">
          Bienvenido, {session?.user?.name || "Usuario"}
        </h1>
        <p className="text-text-muted font-lora">
          Panel de administración del Hotel Kori
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-text-darkest mb-1">{stat.value}</p>
                <p className="text-sm text-text-muted">{stat.label}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardBody>
            <h3 className="font-semibold text-text-darkest mb-4">Actividad Reciente</h3>
            <div className="space-y-4">
              {[
                { time: "Hace 5 min", action: "Nueva reserva - Habitación 201", type: "success" },
                { time: "Hace 15 min", action: "Check-out - Habitación 105", type: "info" },
                { time: "Hace 30 min", action: "Check-in - Habitación 312", type: "success" },
                { time: "Hace 1 hora", action: "Reporte de mantenimiento - Piso 3", type: "warning" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-paper-medium/20">
                  <div className={`w-2 h-2 rounded-full ${
                    item.type === "success" ? "bg-emerald-500" :
                    item.type === "warning" ? "bg-amber-500" : "bg-blue-500"
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-text-dark">{item.action}</p>
                    <p className="text-xs text-text-muted">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="font-semibold text-text-darkest mb-4">Estado de Habitaciones</h3>
            <div className="space-y-3">
              {[
                { label: "Disponibles", value: 18, total: 24, color: "bg-emerald-500" },
                { label: "Ocupadas", value: 4, total: 24, color: "bg-red-500" },
                { label: "En Mantenimiento", value: 1, total: 24, color: "bg-amber-500" },
                { label: "Reservadas", value: 1, total: 24, color: "bg-indigo-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">{item.label}</span>
                    <span className="font-medium text-text-dark">{item.value}</span>
                  </div>
                  <div className="h-2 bg-paper-medium/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all`}
                      style={{ width: `${(item.value / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

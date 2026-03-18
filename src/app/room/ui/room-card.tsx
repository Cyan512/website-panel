import type { Habitacion } from "@/app/room/dom/Habitacion";
import { cn } from "@/utils/cn";
import type { HabitationStatus } from "../dom/HabitacionStatus";

type RoomCardProps = {
  room: Habitacion;
  onClick?: () => void;
};

export const STATUS_COLORS: Record<HabitationStatus, string> = {
  Disponible: "bg-emerald-500 shadow-emerald-500/50",
  Ocupado: "bg-danger shadow-danger/50",
  Mantenimiento: "bg-amber-500 shadow-amber-500/50",
  Reservado: "bg-indigo-500 shadow-indigo-500/50",
} as const;

export const STATUS_LABELS: Record<HabitationStatus, string> = {
  Disponible: "Disponible",
  Ocupado: "Ocupado",
  Mantenimiento: "Mantenimiento",
  Reservado: "Reservado",
} as const;

export function RoomCard({ room, onClick }: RoomCardProps) {
  return (
    <div
      key={room.id}
      onClick={onClick}
      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-paper-lightest rounded-2xl border border-border-light/50 hover:border-accent-primary/30"
    >
      {/* Status glow */}
      <div className={cn(
        "absolute top-0 left-0 w-full h-1 transition-all duration-300",
        STATUS_COLORS[room.estado].replace("bg-", "bg-gradient-to-r from-"),
        room.estado === "Disponible" ? "from-emerald-400 to-emerald-600" :
        room.estado === "Ocupado" ? "from-red-400 to-red-600" :
        room.estado === "Reservado" ? "from-indigo-400 to-indigo-600" :
        "from-amber-400 to-amber-600"
      )} />
      
      <div className="p-4 pt-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-300 group-hover:scale-110",
              room.estado === "Disponible" ? "bg-emerald-100 text-emerald-700" :
              room.estado === "Ocupado" ? "bg-red-100 text-red-700" :
              room.estado === "Reservado" ? "bg-indigo-100 text-indigo-700" :
              "bg-amber-100 text-amber-700"
            )}>
              {room.numero}
            </div>
            <div>
              <p className="font-semibold text-text-darkest text-sm">
                Habitación {room.numero}
              </p>
              <p className="text-xs text-text-muted">
                Piso {room.piso}
              </p>
            </div>
          </div>
          
          <span className={cn(
            "px-2.5 py-1 text-[10px] font-semibold rounded-full uppercase tracking-wide",
            room.estado === "Disponible" ? "bg-emerald-100 text-emerald-700" :
            room.estado === "Ocupado" ? "bg-red-100 text-red-700" :
            room.estado === "Reservado" ? "bg-indigo-100 text-indigo-700" :
            "bg-amber-100 text-amber-700"
          )}>
            {STATUS_LABELS[room.estado]}
          </span>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-border-light/30">
          <div>
            <p className="text-xs text-text-muted">Precio/noche</p>
            <p className="font-bold text-accent-primary text-lg">
              S/{room.precio}
            </p>
          </div>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12",
            room.estado === "Disponible" ? "bg-emerald-100 text-emerald-600" :
            room.estado === "Ocupado" ? "bg-red-100 text-red-600" :
            room.estado === "Reservado" ? "bg-indigo-100 text-indigo-600" :
            "bg-amber-100 text-amber-600"
          )}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

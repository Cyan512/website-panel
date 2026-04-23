import { useNavigate } from "react-router-dom";
import type { Habitacion } from "../types";
import { cn } from "@/shared/utils/cn";
import { MdVisibility, MdEdit, MdDelete } from "react-icons/md";
import { obtenerEstadoHabitacion, estadoHabitacionColors} from "@/shared/utils/habitacion";

type RoomCardProps = {
  room: Habitacion;
  onEdit?: () => void;
  onDelete?: () => void;
};

export const STATUS_LABELS: Record<string, string> = {
  DISPONIBLE: "Disponible",
  OCUPADA: "Ocupada",
  MANTENIMIENTO: "Mantenimiento",
  RESERVADA: "Reservada",
  LIMPIEZA: "Limpieza",
};

export function RoomCard({ room, onEdit, onDelete }: RoomCardProps) {
  const navigate = useNavigate();
  const estadoCalculado = obtenerEstadoHabitacion(room.estado, room.fechas_reserva ?? []);

  return (
    <>
       <div className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-bg-card rounded-2xl border border-border hover:border-accent/50">

        <div className="p-4 pt-3">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold transition-all duration-300 group-hover:scale-110", estadoHabitacionColors[estadoCalculado])}>
                {room.nro_habitacion}
              </div>
              <div>
                <p className="font-semibold text-text-primary text-sm">Hab. {room.nro_habitacion}</p>
                <p className="text-xs text-text-muted">Piso {room.piso}</p>
                <p className="text-xs text-text-muted">{room.tipo_habitacion?.nombre ?? "Sin tipo"}</p>
              </div>
            </div>
            <span className={cn("px-2.5 py-1 text-[10px] font-semibold rounded-full uppercase tracking-wide", estadoHabitacionColors[estadoCalculado])}>
              {estadoCalculado}
            </span>
          </div>

          {room.descripcion && <p className="text-xs text-text-muted mb-2 line-clamp-1">{room.descripcion}</p>}

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex gap-2">
              {room.tiene_ducha && <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full text-text-primary border border-border">Ducha</span>}
              {room.tiene_banio && <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full text-text-primary border border-border">Baño</span>}
            </div>
          </div>
        </div>

        <div className="border-t border-border-light/50 bg-paper-medium/10 px-4 py-2.5">
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/rooms/${room.id}`); }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-info/10 text-info border border-info/20 hover:bg-info/20 transition-all text-xs font-medium"
            >
              <MdVisibility className="w-3.5 h-3.5" />
              Ver
            </button>
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-all text-xs font-medium"
              >
                <MdEdit className="w-3.5 h-3.5" />
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-all text-xs font-medium"
              >
                <MdDelete className="w-3.5 h-3.5" />
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>

    </>
  );
}

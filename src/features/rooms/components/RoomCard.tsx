import type { Habitacion } from "../types";
import { cn } from "@/shared/utils/cn";
import { MdCalendarMonth, MdImage, MdEdit, MdDelete } from "react-icons/md";
import { obtenerEstadoHabitacion, estadoHabitacionColors } from "@/shared/utils/habitacion";

type RoomCardProps = {
  room: Habitacion;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewCalendar?: () => void;
  onViewImages?: () => void;
};

export const STATUS_LABELS: Record<string, string> = {
  DISPONIBLE: "Disponible",
  OCUPADA: "Ocupada",
  MANTENIMIENTO: "Mantenimiento",
  RESERVADA: "Reservada",
  LIMPIEZA: "Limpieza",
};

export function RoomCard({ room, onEdit, onDelete, onViewCalendar, onViewImages }: RoomCardProps) {
  const estadoCalculado = obtenerEstadoHabitacion(room.estado, room.fechas_reserva ?? []);
  const hasImages = !!room.url_imagen && room.url_imagen.length > 0;

  return (
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
          <div className="flex flex-col items-end gap-1.5">
            <span className={cn("px-2.5 py-1 text-[10px] font-semibold rounded-full uppercase tracking-wide", estadoHabitacionColors[estadoCalculado])}>
              {estadoCalculado}
            </span>
            <div className="flex items-center gap-1">
              {onViewCalendar && (
                <button
                  onClick={(e) => { e.stopPropagation(); onViewCalendar(); }}
                  className="p-1.5 rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-all"
                  title="Ver calendario"
                >
                  <MdCalendarMonth className="w-3.5 h-3.5" />
                </button>
              )}
              {hasImages && onViewImages && (
                <button
                  onClick={(e) => { e.stopPropagation(); onViewImages(); }}
                  className="p-1.5 rounded-lg bg-info/10 text-info border border-info/20 hover:bg-info/20 transition-all"
                  title="Ver imágenes"
                >
                  <MdImage className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {room.descripcion && <p className="text-xs text-text-muted mb-2 line-clamp-1">{room.descripcion}</p>}

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex gap-1 flex-wrap">
            {room.feature && room.feature.split(",").map((f, i) => (
              <span key={i} className="px-2 py-0.5 text-[10px] font-semibold rounded-full text-text-primary border border-border">{f.trim()}</span>
            ))}
            {room.amenities && room.amenities.split(",").map((a, i) => (
              <span key={i} className="px-2 py-0.5 text-[10px] font-semibold rounded-full text-text-primary border border-border">{a.trim()}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border-light/50 bg-paper-medium/10 px-4 py-2.5">
        <div className="flex gap-2">
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
  );
}

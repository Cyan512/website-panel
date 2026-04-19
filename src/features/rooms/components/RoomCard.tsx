import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Habitacion, FechaReserva } from "../types";
import { cn } from "@/utils/cn";
import { RoomCalendar } from "./RoomCalendar";
import { roomsApi } from "../api";
import { MdCalendarMonth } from "react-icons/md";
import { obtenerEstadoHabitacion, estadoHabitacionColors, estadoHabitacionBar } from "@/utils/habitacion.utils";

type RoomCardProps = {
  room: Habitacion;
  onClick?: () => void;
};

export const STATUS_LABELS: Record<string, string> = {
  DISPONIBLE: "Disponible",
  OCUPADA: "Ocupada",
  MANTENIMIENTO: "Mantenimiento",
  RESERVADA: "Reservada",
  LIMPIEZA: "Limpieza",
};

export function RoomCard({ room, onClick }: RoomCardProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [fechasReserva, setFechasReserva] = useState<FechaReserva[]>([]);
  const [loadingFechas, setLoadingFechas] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const estadoCalculado = obtenerEstadoHabitacion(room.estado, room.fechas_reserva ?? []);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!calendarOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [calendarOpen]);

  const handleCalendarClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (calendarOpen) { setCalendarOpen(false); return; }

    // Calcular posición del dropdown relativa al viewport
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const dropdownWidth = 288; // w-72
      const dropdownHeight = 320;
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      const top = spaceAbove > dropdownHeight || spaceAbove > spaceBelow
        ? rect.top + window.scrollY - dropdownHeight - 8
        : rect.bottom + window.scrollY + 8;

      const left = Math.min(
        rect.right + window.scrollX - dropdownWidth,
        window.innerWidth - dropdownWidth - 8
      );

      setDropdownPos({ top, left: Math.max(8, left) });
    }

    setCalendarOpen(true);
    if (fechasReserva.length === 0) {
      setLoadingFechas(true);
      try {
        const detail = await roomsApi.getById(room.id, ["TENTATIVA", "CONFIRMADA", "EN_CASA"]);
        setFechasReserva(detail.fechas_reserva ?? []);
      } catch {
        setFechasReserva([]);
      } finally {
        setLoadingFechas(false);
      }
    }
  };

  return (
    <>
      <div
        onClick={onClick}
        className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-bg-card rounded-2xl border border-border hover:border-accent/50"
      >
        <div className={cn("absolute top-0 left-0 w-full h-1", estadoHabitacionBar[estadoCalculado])} />

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
              <span className={cn("px-2 py-0.5 text-[10px] font-semibold rounded-full", room.tiene_ducha ? "bg-emerald-500 text-emerald-100" : "bg-stone-500 text-stone-100")}>Ducha</span>
              <span className={cn("px-2 py-0.5 text-[10px] font-semibold rounded-full", room.tiene_banio ? "bg-emerald-500 text-emerald-100" : "bg-stone-500 text-stone-100")}>Baño</span>
            </div>
            <button
              ref={btnRef}
              onClick={handleCalendarClick}
              title="Ver disponibilidad"
              className={cn("p-1.5 rounded-lg transition-all", calendarOpen ? "bg-primary/15 text-primary" : "text-text-muted hover:text-primary hover:bg-primary/10")}
            >
              <MdCalendarMonth className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown via portal — escapa del overflow-hidden */}
      {calendarOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: "absolute", top: dropdownPos.top, left: dropdownPos.left, zIndex: 9998 }}
          className="w-72 bg-bg-card border border-border rounded-2xl shadow-2xl p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
            Disponibilidad · Hab. {room.nro_habitacion}
          </p>
          {loadingFechas ? (
            <p className="text-xs text-text-muted text-center py-6">Cargando...</p>
          ) : (
            <RoomCalendar fechasReserva={fechasReserva} />
          )}
        </div>,
        document.body
      )}
    </>
  );
}

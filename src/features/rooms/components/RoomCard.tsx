import { useState } from "react";
import type { Habitacion } from "../types";
import { cn } from "@/utils/cn";
import { ImageCarousel } from "./ImageCarousel";

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
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const images = room.url_imagen ?? [];
  const disponible = room.estado === true;

  return (
    <>
      <div
        onClick={onClick}
        className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-bg-card rounded-2xl border border-border hover:border-accent/50"
      >
        {/* Status bar */}
        <div className={cn("absolute top-0 left-0 w-full h-1", disponible ? "bg-gradient-to-r from-emerald-400 to-emerald-600" : "bg-gradient-to-r from-red-400 to-red-600")} />



        <div className="p-4 pt-3">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold transition-all duration-300 group-hover:scale-110", disponible ? "bg-emerald-500 text-emerald-100" : "bg-red-500 text-red-100")}>
                {room.nro_habitacion}
              </div>
              <div>
                <p className="font-semibold text-text-primary text-sm">Hab. {room.nro_habitacion}</p>
                <p className="text-xs text-text-muted">Piso {room.piso}</p>
                <p className="text-xs text-text-muted">{room.tipo_habitacion?.nombre ?? "Sin tipo"}</p>
              </div>
            </div>
            <span className={cn("px-2.5 py-1 text-[10px] font-semibold rounded-full uppercase tracking-wide", disponible ? "bg-emerald-500 text-emerald-100" : "bg-red-500 text-red-100")}>
              {disponible ? "Disponible" : "Ocupada"}
            </span>
          </div>

          {room.descripcion && (
            <p className="text-xs text-text-muted mb-2 line-clamp-1">{room.descripcion}</p>
          )}

          <div className="flex gap-2 pt-2 border-t border-border/50">
            <span className={cn("px-2 py-0.5 text-[10px] font-semibold rounded-full", room.tiene_ducha ? "bg-emerald-500 text-emerald-100" : "bg-stone-500 text-stone-100")}>Ducha</span>
            <span className={cn("px-2 py-0.5 text-[10px] font-semibold rounded-full", room.tiene_banio ? "bg-emerald-500 text-emerald-100" : "bg-stone-500 text-stone-100")}>Baño</span>
          </div>
        </div>
      </div>

      <ImageCarousel images={images} isOpen={carouselOpen} onClose={() => setCarouselOpen(false)} initialIndex={carouselIndex} />
    </>
  );
}

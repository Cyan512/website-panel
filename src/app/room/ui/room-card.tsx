import type { Habitacion } from "@/app/room/dom/Habitacion";
import { cn } from "@/utils/cn";
import type { HabitationStatus } from "../dom/HabitacionStatus";

type RoomCardProps = {
  room: Habitacion;
  onClick?: () => void;
};

export function RoomCard({ room, onClick }: RoomCardProps) {
  const STATUS_COLORS: Record<HabitationStatus, string> = {
    Disponible: "bg-green-500",
    Ocupado: "bg-danger-dark",
    Mantenimiento: "bg-brand-dark",
    Reservado: "bg-neutral-dark"
  }

  return (
    <div
      key={room.id}
      onClick={onClick}
      className="overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 border"
    >
      <div className="p-3 flex justify-between items-start">
        <div>
          <div className="text-xl font-fell leading-none">{room.numero}</div>
          <div className="text-xs italic mt-0.5">{room.tipo}</div>
        </div>
        <div className={cn("w-2 h-2 rounded-full mt-1 shrink-0",
          STATUS_COLORS[room.estado]
        )} />
      </div>
      <div className="border-t px-3 py-1.5 flex justify-between items-center text-xs italic">
        <div>
          S/{room.precio}
        </div>
        <div >
          huesped
        </div>
      </div>
    </div>
  );
}

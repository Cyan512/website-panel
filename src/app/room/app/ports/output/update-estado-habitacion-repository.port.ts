import type { UpdateEstadoHabitacionDto } from "@/app/room/dom/Habitacion";
import type { Habitacion } from "@/app/room/dom/Habitacion";

export interface UpdateEstadoHabitacionRepositoryPort {
  updateEstado(id: string, data: UpdateEstadoHabitacionDto): Promise<Habitacion>;
}

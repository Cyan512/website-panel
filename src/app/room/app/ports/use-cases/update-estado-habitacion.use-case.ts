import type { Habitacion } from "@/app/room/dom/Habitacion";
import type { UpdateEstadoHabitacionDto } from "@/app/room/dom/Habitacion";

export interface UpdateEstadoHabitacionUseCase {
  execute(id: string, data: UpdateEstadoHabitacionDto): Promise<Habitacion>;
}

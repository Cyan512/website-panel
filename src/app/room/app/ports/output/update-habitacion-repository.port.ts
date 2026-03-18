import type { UpdateHabitacionDto } from "@/app/room/dom/Habitacion";
import type { Habitacion } from "@/app/room/dom/Habitacion";

export interface UpdateHabitacionRepositoryPort {
  update(id: string, data: UpdateHabitacionDto): Promise<Habitacion>;
}

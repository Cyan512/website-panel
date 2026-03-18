import type { Habitacion } from "@/app/room/dom/Habitacion";
import type { UpdateHabitacionDto } from "@/app/room/dom/Habitacion";

export interface UpdateHabitacionUseCase {
  execute(id: string, data: UpdateHabitacionDto): Promise<Habitacion>;
}

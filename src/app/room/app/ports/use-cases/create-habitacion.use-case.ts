import type { Habitacion, CreateHabitacionDto } from "@/app/room/dom/Habitacion";

export interface CreateHabitacionUseCase {
  execute(data: CreateHabitacionDto): Promise<Habitacion>;
}

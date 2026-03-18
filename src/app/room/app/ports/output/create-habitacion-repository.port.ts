import type { Habitacion } from "@/app/room/dom/Habitacion";
import type { CreateHabitacionDto } from "@/app/room/dom/Habitacion";

export interface CreateHabitacionRepositoryPort {
  create(data: CreateHabitacionDto): Promise<Habitacion>;
}

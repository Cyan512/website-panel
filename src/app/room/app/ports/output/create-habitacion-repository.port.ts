import type { Habitacion } from "@/app/room/dom/Habitacion";
import type { CreateHabitacionDto } from "@/app/room/dom/CreateHabitacionDto";

export interface CreateHabitacionRepositoryPort {
  create(data: CreateHabitacionDto): Promise<Habitacion>;
}

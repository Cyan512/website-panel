import type { Habitacion } from "@/app/room/dom/Habitacion";

export interface HabitacionRepositoryPort {
  getById(id: string): Promise<Habitacion>;
}

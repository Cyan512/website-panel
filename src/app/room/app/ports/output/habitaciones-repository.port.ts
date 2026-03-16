import type { Habitacion } from "@/app/room/dom/Habitacion";

export interface HabitacionesRepositoryPort {
  getAll(): Promise<Habitacion[]>;
}

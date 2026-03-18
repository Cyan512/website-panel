import type { TipoHabitacion } from "@/app/room/dom/TipoHabitacion";

export interface TiposHabitacionRepositoryPort {
  getAll(): Promise<TipoHabitacion[]>;
  getById(id: string): Promise<TipoHabitacion>;
}

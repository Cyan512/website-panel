import type { TipoHabitacion } from "@/app/room/dom/TipoHabitacion";

export interface GetTiposHabitacionUseCase {
  execute(): Promise<TipoHabitacion[]>;
}

export interface GetTipoHabitacionUseCase {
  execute(id: string): Promise<TipoHabitacion>;
}

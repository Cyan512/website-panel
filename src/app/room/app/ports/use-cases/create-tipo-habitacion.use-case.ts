import type { TipoHabitacion } from "@/app/room/dom/TipoHabitacion";
import type { CreateTipoHabitacionDto } from "@/app/room/dom/CreateTipoHabitacionDto";

export interface CreateTipoHabitacionUseCase {
  execute(data: CreateTipoHabitacionDto): Promise<TipoHabitacion>;
}

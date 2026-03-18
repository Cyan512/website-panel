import type { TipoHabitacion } from "@/app/room/dom/TipoHabitacion";
import type { UpdateTipoHabitacionDto } from "@/app/room/dom/UpdateTipoHabitacionDto";

export interface UpdateTipoHabitacionUseCase {
  execute(id: string, data: UpdateTipoHabitacionDto): Promise<TipoHabitacion>;
}

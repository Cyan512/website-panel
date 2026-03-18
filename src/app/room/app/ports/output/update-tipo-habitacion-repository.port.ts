import type { TipoHabitacion } from "@/app/room/dom/TipoHabitacion";
import type { UpdateTipoHabitacionDto } from "@/app/room/dom/UpdateTipoHabitacionDto";

export interface UpdateTipoHabitacionRepositoryPort {
  update(id: string, data: UpdateTipoHabitacionDto): Promise<TipoHabitacion>;
}

import type { TipoHabitacion } from "@/app/room/dom/TipoHabitacion";
import type { UpdateTipoHabitacionDto } from "@/app/room/dom/UpdateTipoHabitacionDto";
import type { UpdateTipoHabitacionUseCase } from "@/app/room/app/ports/use-cases/update-tipo-habitacion.use-case";
import { updateTipoHabitacionRepository } from "@/app/room/infra/repositories/update-tipo-habitacion.repository";

export class UpdateTipoHabitacionService implements UpdateTipoHabitacionUseCase {
  async execute(id: string, data: UpdateTipoHabitacionDto): Promise<TipoHabitacion> {
    if (!id) {
      throw new Error("El ID del tipo de habitación es requerido");
    }
    return updateTipoHabitacionRepository.update(id, data);
  }
}

export const updateTipoHabitacionService = new UpdateTipoHabitacionService();

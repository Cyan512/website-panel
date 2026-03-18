import type { Habitacion } from "@/app/room/dom/Habitacion";
import type { UpdateHabitacionDto } from "@/app/room/dom/Habitacion";
import type { UpdateHabitacionUseCase } from "@/app/room/app/ports/use-cases/update-habitacion.use-case";
import { updateHabitacionRepository } from "@/app/room/infra/repositories/update-habitacion.repository";

export class UpdateHabitacionService implements UpdateHabitacionUseCase {
  async execute(id: string, data: UpdateHabitacionDto): Promise<Habitacion> {
    if (!id) {
      throw new Error("El ID de la habitación es requerido");
    }
    return updateHabitacionRepository.update(id, data);
  }
}

export const updateHabitacionService = new UpdateHabitacionService();

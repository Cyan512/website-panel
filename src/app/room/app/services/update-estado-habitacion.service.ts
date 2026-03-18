import type { Habitacion } from "@/app/room/dom/Habitacion";
import type { UpdateEstadoHabitacionDto } from "@/app/room/dom/Habitacion";
import type { UpdateEstadoHabitacionUseCase } from "@/app/room/app/ports/use-cases/update-estado-habitacion.use-case";
import { updateEstadoHabitacionRepository } from "@/app/room/infra/repositories/update-estado-habitacion.repository";

export class UpdateEstadoHabitacionService implements UpdateEstadoHabitacionUseCase {
  async execute(id: string, data: UpdateEstadoHabitacionDto): Promise<Habitacion> {
    if (!id) {
      throw new Error("El ID de la habitación es requerido");
    }
    if (!data.estado && !data.limpieza) {
      throw new Error("Debe proporcionar al menos un campo (estado o limpieza)");
    }
    return updateEstadoHabitacionRepository.updateEstado(id, data);
  }
}

export const updateEstadoHabitacionService = new UpdateEstadoHabitacionService();

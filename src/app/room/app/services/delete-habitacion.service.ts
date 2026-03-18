import type { DeleteHabitacionUseCase } from "@/app/room/app/ports/use-cases/delete-habitacion.use-case";
import { deleteHabitacionRepository } from "@/app/room/infra/repositories/delete-habitacion.repository";

export class DeleteHabitacionService implements DeleteHabitacionUseCase {
  async execute(id: string): Promise<void> {
    if (!id) {
      throw new Error("El ID de la habitación es requerido");
    }
    return deleteHabitacionRepository.delete(id);
  }
}

export const deleteHabitacionService = new DeleteHabitacionService();

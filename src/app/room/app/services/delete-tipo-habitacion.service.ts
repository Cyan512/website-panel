import type { DeleteTipoHabitacionUseCase } from "@/app/room/app/ports/use-cases/delete-tipo-habitacion.use-case";
import { deleteTipoHabitacionRepository } from "@/app/room/infra/repositories/delete-tipo-habitacion.repository";

export class DeleteTipoHabitacionService implements DeleteTipoHabitacionUseCase {
  async execute(id: string): Promise<void> {
    if (!id) {
      throw new Error("El ID del tipo de habitación es requerido");
    }
    return deleteTipoHabitacionRepository.delete(id);
  }
}

export const deleteTipoHabitacionService = new DeleteTipoHabitacionService();

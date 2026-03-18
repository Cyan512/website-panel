import type { DeleteMuebleUseCase } from "@/app/stock/app/ports/use-cases/delete-mueble.use-case";
import { deleteMuebleRepository } from "@/app/stock/infra/repositories/delete-mueble.repository";

export class DeleteMuebleService implements DeleteMuebleUseCase {
  async execute(id: string): Promise<void> {
    if (!id) {
      throw new Error("El ID del mueble es requerido");
    }
    return deleteMuebleRepository.delete(id);
  }
}

export const deleteMuebleService = new DeleteMuebleService();

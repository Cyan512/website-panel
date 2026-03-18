import type { Mueble } from "@/app/stock/dom/Mueble";
import type { GetMuebleUseCase } from "@/app/stock/app/ports/use-cases/get-mueble.use-case";
import { getMuebleRepository } from "@/app/stock/infra/repositories/get-mueble.repository";

export class GetMuebleService implements GetMuebleUseCase {
  async execute(id: string): Promise<Mueble> {
    if (!id) {
      throw new Error("El ID del mueble es requerido");
    }
    return getMuebleRepository.getById(id);
  }
}

export const getMuebleService = new GetMuebleService();

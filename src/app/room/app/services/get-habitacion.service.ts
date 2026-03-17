import type { Habitacion } from "@/app/room/dom/Habitacion";
import type { GetHabitacionUseCase } from "@/app/room/app/ports/use-cases/get-habitacion.use-case";
import { getHabitacionRepository } from "@/app/room/infra/repositories/get-habitacion.repository";

export class GetHabitacionService implements GetHabitacionUseCase {
  async execute(id: string): Promise<Habitacion> {
    if (!id) {
      throw new Error("El ID de la habitación es requerido");
    }
    return getHabitacionRepository.getById(id);
  }
}

export const getHabitacionService = new GetHabitacionService();

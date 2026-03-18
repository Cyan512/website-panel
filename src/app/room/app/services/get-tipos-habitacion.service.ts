import type { TipoHabitacion } from "@/app/room/dom/TipoHabitacion";
import type { GetTiposHabitacionUseCase, GetTipoHabitacionUseCase } from "@/app/room/app/ports/use-cases/get-tipos-habitacion.use-case";
import { getTiposHabitacionRepository } from "@/app/room/infra/repositories/get-tipos-habitacion.repository";

export class GetTiposHabitacionService implements GetTiposHabitacionUseCase {
  async execute(): Promise<TipoHabitacion[]> {
    return getTiposHabitacionRepository.getAll();
  }
}

export class GetTipoHabitacionService implements GetTipoHabitacionUseCase {
  async execute(id: string): Promise<TipoHabitacion> {
    if (!id) {
      throw new Error("El ID del tipo de habitación es requerido");
    }
    return getTiposHabitacionRepository.getById(id);
  }
}

export const getTiposHabitacionService = new GetTiposHabitacionService();
export const getTipoHabitacionService = new GetTipoHabitacionService();

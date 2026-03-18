import type { TipoHabitacion } from "@/app/room/dom/TipoHabitacion";
import type { CreateTipoHabitacionDto } from "@/app/room/dom/CreateTipoHabitacionDto";
import type { CreateTipoHabitacionUseCase } from "@/app/room/app/ports/use-cases/create-tipo-habitacion.use-case";
import { createTipoHabitacionRepository } from "@/app/room/infra/repositories/create-tipo-habitacion.repository";

export class CreateTipoHabitacionService implements CreateTipoHabitacionUseCase {
  async execute(data: CreateTipoHabitacionDto): Promise<TipoHabitacion> {
    if (!data.nombre || !data.tiene_ducha || data.tiene_banio === undefined) {
      throw new Error("Los datos del tipo de habitación son requeridos");
    }
    return createTipoHabitacionRepository.create(data);
  }
}

export const createTipoHabitacionService = new CreateTipoHabitacionService();

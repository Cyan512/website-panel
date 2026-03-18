import type { Habitacion, CreateHabitacionDto } from "@/app/room/dom/Habitacion";
import type { CreateHabitacionUseCase } from "@/app/room/app/ports/use-cases/create-habitacion.use-case";
import { createHabitacionRepository } from "@/app/room/infra/repositories/create-habitacion.repository";

export class CreateHabitacionService implements CreateHabitacionUseCase {
  async execute(data: CreateHabitacionDto): Promise<Habitacion> {
    if (!data.nro_habitacion || !data.piso || !data.tipo_id) {
      throw new Error("El número de habitación, piso y tipo son requeridos");
    }
    return createHabitacionRepository.create(data);
  }
}

export const createHabitacionService = new CreateHabitacionService();

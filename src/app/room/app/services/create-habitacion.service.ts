import type { Habitacion } from "@/app/room/dom/Habitacion";
import type { CreateHabitacionDto } from "@/app/room/dom/CreateHabitacionDto";
import type { CreateHabitacionUseCase } from "@/app/room/app/use-cases/create-habitacion.use-case";
import { createHabitacionRepository } from "@/app/room/infra/repositories/create-habitacion.repository";

export class CreateHabitacionService implements CreateHabitacionUseCase {
  async execute(data: CreateHabitacionDto): Promise<Habitacion> {
    if (!data.numero || !data.piso || !data.tipo) {
      throw new Error("Los datos de la habitación son requeridos");
    }
    if (data.precio <= 0) {
      throw new Error("El precio debe ser mayor a 0");
    }
    return createHabitacionRepository.create(data);
  }
}

export const createHabitacionService = new CreateHabitacionService();

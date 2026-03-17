import type { Habitacion } from "@/app/room/dom/Habitacion";
import type { GetHabitacionesUseCase } from "@/app/room/app/use-cases/get-habitaciones.use-case";
import { getHabitacionesRepository } from "@/app/room/infra/repositories/get-habitaciones.repository";

export class GetHabitacionesService implements GetHabitacionesUseCase {
  async execute(): Promise<Habitacion[]> {
    return getHabitacionesRepository.getAll();
  }
}

export const getHabitacionesService = new GetHabitacionesService();

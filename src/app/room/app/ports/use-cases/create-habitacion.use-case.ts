import type { Habitacion } from "@/app/room/dom/Habitacion";
import type { CreateHabitacionDto } from "@/app/room/dom/CreateHabitacionDto";
import { createHabitacionRepository } from "@/app/room/infra/repositories/create-habitacion.repository";

export interface CreateHabitacionUseCase {
  execute(data: CreateHabitacionDto): Promise<Habitacion>;
}

export const createHabitacionUseCase: CreateHabitacionUseCase = {
  execute: async (data: CreateHabitacionDto): Promise<Habitacion> => {
    if (!data.numero || !data.piso || !data.tipo) {
      throw new Error("Los datos de la habitación son requeridos");
    }
    if (data.precio <= 0) {
      throw new Error("El precio debe ser mayor a 0");
    }
    return createHabitacionRepository.create(data);
  },
};

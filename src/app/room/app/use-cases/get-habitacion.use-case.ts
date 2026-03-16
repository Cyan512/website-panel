import type { Habitacion } from "@/app/room/dom/Habitacion";
import { getHabitacionRepository } from "@/app/room/infra/repositories/get-habitacion.repository";

export interface GetHabitacionUseCase {
  execute(id: string): Promise<Habitacion>;
}

export const getHabitacionUseCase: GetHabitacionUseCase = {
  execute: async (id: string): Promise<Habitacion> => {
    if (!id) {
      throw new Error("El ID de la habitación es requerido");
    }
    return getHabitacionRepository.getById(id);
  },
};

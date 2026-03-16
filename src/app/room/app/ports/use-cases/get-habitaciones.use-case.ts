import type { Habitacion } from "@/app/room/dom/Habitacion";
import { getHabitacionesRepository } from "@/app/room/infra/repositories/get-habitaciones.repository";

export interface GetHabitacionesUseCase {
  execute(): Promise<Habitacion[]>;
}

export const getHabitacionesUseCase: GetHabitacionesUseCase = {
  execute: async (): Promise<Habitacion[]> => {
    return getHabitacionesRepository.getAll();
  },
};

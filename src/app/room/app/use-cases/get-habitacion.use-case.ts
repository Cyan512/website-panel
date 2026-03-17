import type { Habitacion } from "@/app/room/dom/Habitacion";

export interface GetHabitacionUseCase {
  execute(id: string): Promise<Habitacion>;
}

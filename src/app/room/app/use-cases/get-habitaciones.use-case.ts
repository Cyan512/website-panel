import type { Habitacion } from "@/app/room/dom/Habitacion";

export interface GetHabitacionesUseCase {
  execute(): Promise<Habitacion[]>;
}

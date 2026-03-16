import type { Habitacion } from "@/app/room/dom/Habitacion";
import type { CreateHabitacionDto } from "@/app/room/dom/CreateHabitacionDto";

export interface RoomPort {
  getAll(): Promise<Habitacion[]>;
  getById(id: string): Promise<Habitacion>;
  create(data: CreateHabitacionDto): Promise<Habitacion>;
}

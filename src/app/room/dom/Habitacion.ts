import type { HabitationStatus } from "@/app/room/dom/HabitacionStatus";
import type { HabitationType } from "@/app/room/dom/HabitacionType";

export interface Habitacion {
  id: string;
  numero: string;
  piso: number;
  tipo: HabitationType;
  precio: number | null;
  estado: HabitationStatus;
  createdAt: Date;
  updatedAt: Date;
}

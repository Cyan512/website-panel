import type { HabitationStatus } from "@/models/HabitacionStatus";
import type { HabitationType } from "@/models/HabitacionType";

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

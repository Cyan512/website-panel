import type { HabitationType } from "@/models/HabitacionType";

export interface CreateHabitacionDto {
  numero: string;
  piso: number;
  tipo: HabitationType;
  precio: number | null;
}

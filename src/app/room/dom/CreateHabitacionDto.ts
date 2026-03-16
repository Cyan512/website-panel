import type { HabitationType } from "@/app/room/dom/HabitacionType";

export interface CreateHabitacionDto {
  numero: string;
  piso: number;
  tipo: HabitationType;
  precio: number | null;
}

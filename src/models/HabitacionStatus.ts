export const HabitationStatus = {
  Disponible: "Disponible",
  Ocupado: "Ocupado",
  Mantenimiento: "Mantenimiento",
  Reservado: "Reservado",
} as const;

export type HabitationStatus =
  (typeof HabitationStatus)[keyof typeof HabitationStatus];

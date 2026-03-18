export const EstadoHabitacion = {
  DISPONIBLE: "DISPONIBLE",
  RESERVADA: "RESERVADA",
  OCUPADA: "OCUPADA",
  LIMPIEZA: "LIMPIEZA",
  MANTENIMIENTO: "MANTENIMIENTO",
} as const;

export type EstadoHabitacion =
  (typeof EstadoHabitacion)[keyof typeof EstadoHabitacion];

export const EstadoLimpieza = {
  LIMPIA: "LIMPIA",
  SUCIA: "SUCIA",
  EN_LIMPIEZA: "EN_LIMPIEZA",
  INSPECCION: "INSPECCION",
} as const;

export type EstadoLimpieza =
  (typeof EstadoLimpieza)[keyof typeof EstadoLimpieza];

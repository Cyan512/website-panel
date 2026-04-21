import type { FechaReserva } from "@/features/rooms/types";

export type EstadoHabitacionCalculado =
  | "DISPONIBLE"
  | "OCUPADA"
  | "RESERVADA"
  | "PENDIENTE"
  | "NO DISPONIBLE";

const PRIORIDAD: Record<string, number> = {
  EN_CASA: 4,
  CONFIRMADA: 3,
  TENTATIVA: 2,
  COMPLETADA: 1,
  CANCELADA: 1,
  NO_LLEGO: 1,
};

/**
 * Calcula el estado visual de una habitación para una fecha dada.
 *
 * @param habitacionEstado  boolean del backend (false = mantenimiento/no disponible)
 * @param fechasReserva     lista de reservas con fecha_inicio, fecha_fin y estado
 * @param fechaActual       fecha a evaluar (por defecto hoy)
 */
export function obtenerEstadoHabitacion(
  habitacionEstado: boolean,
  fechasReserva: FechaReserva[],
  fechaActual: Date = new Date()
): EstadoHabitacionCalculado {
  if (!habitacionEstado) return "NO DISPONIBLE";

  const fechaStr = fechaActual.toISOString().split("T")[0];

  // Filtrar reservas activas en la fecha dada
  const activas = fechasReserva.filter((r) => {
    const inicio = r.fecha_inicio.slice(0, 10);
    const fin = r.fecha_fin.slice(0, 10);
    return fechaStr >= inicio && fechaStr <= fin;
  });

  if (activas.length === 0) return "DISPONIBLE";

  // Ordenar por prioridad descendente y tomar la más alta
  const top = activas.sort(
    (a, b) => (PRIORIDAD[b.estado] ?? 0) - (PRIORIDAD[a.estado] ?? 0)
  )[0];

  switch (top.estado) {
    case "EN_CASA":    return "OCUPADA";
    case "CONFIRMADA": return "RESERVADA";
    case "TENTATIVA":  return "PENDIENTE";
    default:           return "DISPONIBLE";
  }
}

export const estadoHabitacionColors: Record<EstadoHabitacionCalculado, string> = {
  DISPONIBLE:      "bg-success-bg text-success border border-success/20",
  OCUPADA:         "bg-danger-bg text-danger border border-danger/20",
  RESERVADA:       "bg-info-bg text-info border border-info/20",
  PENDIENTE:       "bg-warning-bg text-warning border border-warning/20",
  "NO DISPONIBLE": "bg-bg-tertiary text-text-muted border border-border/50",
};

export const estadoHabitacionBar: Record<EstadoHabitacionCalculado, string> = {
  DISPONIBLE:      "bg-gradient-to-r from-success/40 to-success-bg",
  OCUPADA:         "bg-gradient-to-r from-danger/40 to-danger-bg",
  RESERVADA:       "bg-gradient-to-r from-info/40 to-info-bg",
  PENDIENTE:       "bg-gradient-to-r from-warning/40 to-warning-bg",
  "NO DISPONIBLE": "bg-gradient-to-r from-bg-tertiary/60 to-bg-tertiary/30",
};

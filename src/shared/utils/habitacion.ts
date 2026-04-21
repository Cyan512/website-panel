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
  DISPONIBLE:      "bg-emerald-500 text-emerald-100",
  OCUPADA:         "bg-red-500 text-red-100",
  RESERVADA:       "bg-blue-500 text-blue-100",
  PENDIENTE:       "bg-amber-500 text-amber-100",
  "NO DISPONIBLE": "bg-gray-400 text-gray-100",
};

export const estadoHabitacionBar: Record<EstadoHabitacionCalculado, string> = {
  DISPONIBLE:      "bg-gradient-to-r from-emerald-400 to-emerald-600",
  OCUPADA:         "bg-gradient-to-r from-red-400 to-red-600",
  RESERVADA:       "bg-gradient-to-r from-blue-400 to-blue-600",
  PENDIENTE:       "bg-gradient-to-r from-amber-400 to-amber-600",
  "NO DISPONIBLE": "bg-gradient-to-r from-gray-400 to-gray-500",
};

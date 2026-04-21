import type { Huesped } from "@/features/clients/types";
import type { Habitacion } from "@/features/rooms/types";

export type EstadoEstadia = "EN_CASA" | "COMPLETADA" | "SALIDA_ANTICIPADA";

export const estadoEstadiaLabels: Record<EstadoEstadia, string> = {
  EN_CASA: "En Casa",
  COMPLETADA: "Completada",
  SALIDA_ANTICIPADA: "Salida Anticipada",
};

export const estadoEstadiaColors: Record<EstadoEstadia, string> = {
  EN_CASA: "bg-info-bg text-info",
  COMPLETADA: "bg-success-bg text-success",
  SALIDA_ANTICIPADA: "bg-warning-bg text-warning",
};

export interface Estancia {
  id: string;
  reserva_id: string;
  habitacion: Habitacion;
  huesped: Huesped;
  fecha_entrada: string;
  fecha_salida: string | null;
  estado: EstadoEstadia;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEstancia {
  reservaId: string;
  habitacionId: string;
  huespedId: string;
  fechaEntrada?: Date;
  fechaSalida?: Date | null;
  estado?: EstadoEstadia;
  notas?: string | null;
}

export interface UpdateEstancia {
  reservaId?: string;
  habitacionId?: string;
  huespedId?: string;
  fechaEntrada?: Date;
  fechaSalida?: Date | null;
  estado?: EstadoEstadia;
  notas?: string | null;
}

export interface CheckoutEstancia {
  fechaSalida: Date;
}

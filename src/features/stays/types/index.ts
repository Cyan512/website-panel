import type { Huesped } from "@/features/clients/types";
import type { Habitacion } from "@/features/rooms/types";

export type EstadoEstadia = "ACTIVA" | "CHECKOUT" | "CANCELADA";

export const estadoEstadiaLabels: Record<EstadoEstadia, string> = {
  ACTIVA: "Activa",
  CHECKOUT: "Check-out",
  CANCELADA: "Cancelada",
};

export const estadoEstadiaColors: Record<EstadoEstadia, string> = {
  ACTIVA: "bg-emerald-100 text-emerald-700",
  CHECKOUT: "bg-blue-100 text-blue-700",
  CANCELADA: "bg-red-100 text-red-700",
};

export interface EstanciaOutput {
  id: string;
  reservaId: string;
  habitacion: Habitacion;
  huesped: Huesped;
  fechaEntrada: string;
  fechaSalida: string | null;
  estado: EstadoEstadia;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEstanciaInput {
  reservaId: string;
  habitacionId: string;
  huespedId: string;
  fechaEntrada?: Date;
  fechaSalida?: Date | null;
  estado?: EstadoEstadia;
  notas?: string | null;
}

export interface UpdateEstanciaInput {
  reservaId?: string;
  habitacionId?: string;
  huespedId?: string;
  fechaEntrada?: Date;
  fechaSalida?: Date | null;
  estado?: EstadoEstadia;
  notas?: string | null;
}

export interface CheckoutEstanciaInput {
  fechaSalida: Date;
}

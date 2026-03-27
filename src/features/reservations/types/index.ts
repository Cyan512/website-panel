import type { Huesped } from "@/features/clients/types";
import type { Habitacion } from "@/features/rooms/types";
import type { TarifaOutput } from "@/features/rates/types";

export type EstadoReserva = "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA";

export const estadoReservaLabels: Record<EstadoReserva, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
  COMPLETADA: "Completada",
};

export const estadoReservaColors: Record<EstadoReserva, string> = {
  PENDIENTE: "bg-amber-100 text-amber-700",
  CONFIRMADA: "bg-emerald-100 text-emerald-700",
  CANCELADA: "bg-red-100 text-red-700",
  COMPLETADA: "bg-blue-100 text-blue-700",
};

export interface ReservaOutput {
  id: string;
  codigo: string;
  huesped: Huesped;
  habitacion: Habitacion;
  tarifa: TarifaOutput;
  pagoId: string | null;
  fechaEntrada: string;
  fechaSalida: string;
  adultos: number;
  ninos: number;
  montoDescuento: number | null;
  estado: EstadoReserva;
  motivoCancel: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateReservaInput {
  codigo: string;
  huespedId: string;
  habitacionId: string;
  tarifaId: string;
  fechaEntrada: Date;
  fechaSalida: Date;
  adultos: number;
  ninos: number;
  montoDescuento?: number;
}

export interface UpdateReservaInput {
  huespedId?: string;
  habitacionId?: string;
  tarifaId?: string;
  pagoId?: string | null;
  fechaEntrada?: Date;
  fechaSalida?: Date;
  adultos?: number;
  ninos?: number;
  montoDescuento?: number;
  estado?: EstadoReserva;
}

export interface CancelReservaInput {
  motivoCancel: string;
}

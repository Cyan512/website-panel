import type { Huesped } from "@/features/clients/types";
import type { Tarifa } from "@/features/rates/types";

export type EstadoReserva = "TENTATIVA" | "CONFIRMADA" | "EN_CASA" | "COMPLETADA" | "CANCELADA" | "NO_LLEGO";

export const estadoReservaLabels: Record<EstadoReserva, string> = {
  TENTATIVA: "Tentativa",
  CONFIRMADA: "Confirmada",
  EN_CASA: "En Casa",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
  NO_LLEGO: "No Llegó",
};

export const estadoReservaColors: Record<EstadoReserva, string> = {
  TENTATIVA: "bg-amber-200 text-amber-600",
  CONFIRMADA: "bg-emerald-200 text-emerald-600",
  EN_CASA: "bg-blue-200 text-blue-600",
  COMPLETADA: "bg-indigo-200 text-indigo-600",
  CANCELADA: "bg-red-200 text-red-600",
  NO_LLEGO: "bg-gray-200 text-gray-600",
};

export interface PaginatedReservas {
  list: Reserva[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ReservaHabitacion {
  id: string;
  nro_habitacion: string;
  piso: number;
  estado: string;
}

export interface Reserva {
  id: string;
  codigo: string;
  huesped: Huesped;
  habitacion: ReservaHabitacion;
  tarifa: Tarifa;
  pago: unknown | null;
  fecha_entrada: string;
  fecha_salida: string;
  adultos: number;
  ninos: number;
  nombre_huesped: string;
  nro_habitacion: string;
  nombre_tipo_hab: string;
  nombre_canal: string;
  precio_noche: number;
  iva: number | null;
  cargo_servicios: number | null;
  monto_total: number;
  monto_descuento: number | null;
  monto_final: number;
  estado: EstadoReserva;
  motivo_cancel: string | null;
  cancelado_en: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateReserva {
  huespedId: string;
  habitacionId: string;
  tarifaId: string;
  fechaEntrada: Date;
  fechaSalida: Date;
  adultos: number;
  ninos: number;
  montoDescuento?: number;
}

export interface UpdateReserva {
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

export interface CancelReserva {
  motivoCancel: string;
}

export interface UpdateEstadoReserva {
  estado: EstadoReserva;
}

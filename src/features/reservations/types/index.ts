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
  TENTATIVA: "bg-warning-bg text-warning",
  CONFIRMADA: "bg-success-bg text-success",
  EN_CASA: "bg-info-bg text-info",
  COMPLETADA: "bg-accent-primary/10 text-accent-primary border border-accent-primary/20",
  CANCELADA: "bg-danger-bg text-danger",
  NO_LLEGO: "bg-bg-tertiary text-text-muted border border-border/50",
};

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedReservas {
  list: Reserva[];
  pagination: PaginationMeta;
}

export interface Reserva {
  id: string;
  codigo: string;
  huespedId: string;
  habitacionId: string;
  tarifaId: string;
  pagoId: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  adultos: number;
  ninos: number;
  nombre_huesped: string;
  nro_habitacion: string;
  nombre_tipo_hab: string;
  nombre_canal: string;
  precio_noche: number;
  cantidad_noches: number;
  iva: number | null;
  cargo_servicios: number | null;
  monto_total: number;
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
  fechaInicio: string;
  fechaFin: string;
  adultos: number;
  ninos: number;
}

export interface UpdateReserva {
  huespedId?: string;
  habitacionId?: string;
  tarifaId?: string;
  pagoId?: string | null;
  fechaInicio?: string;
  fechaFin?: string;
  adultos?: number;
  ninos?: number;
  estado?: EstadoReserva;
}

export interface CancelReserva {
  motivoCancel: string;
}

export interface UpdateEstadoReserva {
  estado: EstadoReserva;
}

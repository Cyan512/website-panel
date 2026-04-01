export type EstadoReservaHab = "TENTATIVA" | "CONFIRMADA" | "EN_CASA" | "COMPLETADA" | "CANCELADA" | "NO_LLEGO";

export interface FechaReserva {
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
}

export interface Habitacion {
  id: string;
  nro_habitacion: string;
  tipo_habitacion_id: string;
  tipo_habitacion: TipoHabitacion;
  piso: number;
  tiene_ducha: boolean;
  tiene_banio: boolean;
  url_imagen: string[] | null;
  estado: boolean;
  descripcion: string | null;
  fechas_reserva?: FechaReserva[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedHabitaciones {
  list: Habitacion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CreateHabitacion {
  nro_habitacion: string;
  tipo_habitacion_id: string;
  piso: number;
  tiene_ducha: boolean;
  tiene_banio: boolean;
  imagenes?: File[];
  estado?: boolean;
  descripcion?: string;
}

export interface UpdateHabitacion {
  nro_habitacion?: string;
  tipo_habitacion_id?: string;
  piso?: number;
  tiene_ducha?: boolean;
  tiene_banio?: boolean;
  imagenes_existentes?: string[];
  imagenes?: File[];
  estado?: boolean;
  descripcion?: string;
}

export interface UpdateEstadoHabitacion {
  estado?: boolean;
}

export interface TipoHabitacion {
  id: string;
  nombre: string;
  descripcion: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateTipoHabitacion {
  nombre: string;
  descripcion?: string | null;
  muebles?: string[];
}

export interface UpdateTipoHabitacion {
  nombre?: string;
  descripcion?: string | null;
  muebles?: string[];
}

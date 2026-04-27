export type EstadoReservaHab = "TENTATIVA" | "CONFIRMADA" | "EN_CASA" | "COMPLETADA" | "CANCELADA" | "NO_LLEGO";

export interface FechaReserva {
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
}

export interface HabitacionMueble {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoria: {
    id: string;
    nombre: string;
    descripcion: string | null;
    activo: boolean;
  } | null;
  url_imagen: string | null;
  condicion: string;
  fecha_adquisicion: string | null;
  ultima_revision: string | null;
  habitacion_id: string;
}

export interface Habitacion {
  id: string;
  nro_habitacion: string;
  tipo_habitacion_id: string;
  tipo_habitacion: TipoHabitacion;
  piso: number;
  feature: string | null;
  amenities: string | null;
  url_imagen: string[] | null;
  estado: boolean;
  descripcion: string | null;
  promociones: string[];
  muebles?: HabitacionMueble[];
  fechas_reserva?: FechaReserva[];
  created_at: string;
  updated_at: string;
}

export interface HabitacionDetalle {
  habitacion: Habitacion;
  fechas_reserva: FechaReserva[];
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
  feature?: string;
  amenities?: string;
  imagenes?: File[];
  estado?: boolean;
  descripcion?: string;
}

export interface UpdateHabitacion {
  nro_habitacion?: string;
  tipo_habitacion_id?: string;
  piso?: number;
  feature?: string;
  amenities?: string;
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
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateTipoHabitacion {
  nombre: string;
  muebles?: string[];
}

export interface UpdateTipoHabitacion {
  nombre?: string;
  muebles?: string[];
}

export interface Internacionalizacion {
  id: string;
  habitacion: {
    id: string;
    nro_habitacion: string;
  };
  descripcion_en: string | null;
  descripcion_fr: string | null;
  feature_en: string | null;
  feature_fr: string | null;
  amenities_en: string | null;
  amenities_fr: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInternacionalizacion {
  descripcion_en?: string | null;
  descripcion_fr?: string | null;
  feature_en?: string | null;
  feature_fr?: string | null;
  amenities_en?: string | null;
  amenities_fr?: string | null;
}

export interface UpdateInternacionalizacion {
  descripcion_en?: string | null;
  descripcion_fr?: string | null;
  feature_en?: string | null;
  feature_fr?: string | null;
  amenities_en?: string | null;
  amenities_fr?: string | null;
}

export type EstadoHabitacion = "DISPONIBLE" | "RESERVADA" | "OCUPADA" | "LIMPIEZA" | "MANTENIMIENTO";

export interface Habitacion {
  id: string;
  nro_habitacion: string;
  tipo_habitacion_id: string;
  tipo: TipoHabitacion;
  piso: number;
  tiene_ducha: boolean;
  tiene_banio: boolean;
  url_imagen: string[] | null;
  estado: EstadoHabitacion;
  notas: string | null;
  ulti_limpieza: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateHabitacion {
  nro_habitacion: string;
  tipo_habitacion_id: string;
  piso: number;
  tiene_ducha: boolean;
  tiene_banio: boolean;
  imagenes?: File[];
  estado?: EstadoHabitacion;
  notas?: string | null;
  ulti_limpieza: string;
}

export interface UpdateHabitacion {
  nro_habitacion?: string;
  tipo_habitacion_id: string;
  piso?: number;
  tiene_ducha: boolean;
  tiene_banio: boolean;
  imagenes?: File[];
  estado?: EstadoHabitacion;
  notas?: string | null;
  ulti_limpieza: string;
}

export interface UpdateEstadoHabitacion {
  estado?: EstadoHabitacion;
  ulti_limpieza: string;
}

export interface TipoHabitacion {
  id: string;
  nombre: string;
  descripcion: string | null;
  created_at: Date;
  updated_at: Date;
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

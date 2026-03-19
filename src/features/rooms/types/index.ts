export interface Habitacion {
  id: string;
  nro_habitacion: string;
  tipo_id: string;
  tipo: TipoHabitacion;
  piso: number;
  url_imagen: string | null;
  estado: EstadoHabitacion;
  limpieza: EstadoLimpieza;
  notas: string | null;
  ultima_limpieza: Date | null;
  muebles: TipoMueble[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateHabitacionDto {
  nro_habitacion: string;
  tipo_id: string;
  piso: number;
  url_imagen?: string | null;
  estado?: EstadoHabitacion;
  limpieza?: EstadoLimpieza;
  notas?: string | null;
  muebles?: string[];
}

export interface UpdateHabitacionDto {
  nro_habitacion?: string;
  tipo_id?: string;
  piso?: number;
  url_imagen?: string | null;
  estado?: EstadoHabitacion;
  limpieza?: EstadoLimpieza;
  notas?: string | null;
  muebles?: string[];
}

export interface UpdateEstadoHabitacionDto {
  estado?: EstadoHabitacion;
  limpieza?: EstadoLimpieza;
}

export type EstadoHabitacion = "DISPONIBLE" | "RESERVADA" | "OCUPADA" | "LIMPIEZA" | "MANTENIMIENTO";
export type EstadoLimpieza = "LIMPIA" | "SUCIA" | "EN_LIMPIEZA" | "INSPECCION";

export interface TipoHabitacion {
  id: string;
  nombre: string;
  descripcion: string | null;
  tiene_ducha: boolean;
  tiene_banio: boolean;
  muebles: TipoMueble[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateTipoHabitacionDto {
  nombre: string;
  descripcion?: string | null;
  tiene_ducha?: boolean;
  tiene_banio?: boolean;
  muebles?: string[];
}

export interface UpdateTipoHabitacionDto {
  nombre?: string;
  descripcion?: string | null;
  tiene_ducha?: boolean;
  tiene_banio?: boolean;
  muebles?: string[];
}

export interface TipoMueble {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  tipo: string | null;
  condicion: string;
  fecha_adquisicion: string | null;
  ultima_revision: string | null;
  descripcion: string | null;
  created_at: Date;
  updated_at: Date;
}

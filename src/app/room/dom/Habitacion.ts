export * from "./HabitacionStatus";
export * from "./TipoHabitacion";

import type { Mueble } from "@/app/stock/dom/Mueble";

export interface Habitacion {
  id: string;
  nro_habitacion: string;
  tipo_id: string;
  tipo: {
    id: string;
    nombre: string;
    descripcion: string | null;
    tiene_ducha: boolean;
    tiene_banio: boolean;
    muebles: Mueble[];
    created_at: Date;
    updated_at: Date;
  };
  piso: number;
  url_imagen: string | null;
  estado: "DISPONIBLE" | "RESERVADA" | "OCUPADA" | "LIMPIEZA" | "MANTENIMIENTO";
  limpieza: "LIMPIA" | "SUCIA" | "EN_LIMPIEZA" | "INSPECCION";
  notas: string | null;
  ultima_limpieza: Date | null;
  muebles: Mueble[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateHabitacionDto {
  nro_habitacion: string;
  tipo_id: string;
  piso: number;
  url_imagen?: string | null;
  estado?: "DISPONIBLE" | "RESERVADA" | "OCUPADA" | "LIMPIEZA" | "MANTENIMIENTO";
  limpieza?: "LIMPIA" | "SUCIA" | "EN_LIMPIEZA" | "INSPECCION";
  notas?: string | null;
  muebles?: string[];
}

export interface UpdateHabitacionDto {
  nro_habitacion?: string;
  tipo_id?: string;
  piso?: number;
  url_imagen?: string | null;
  estado?: "DISPONIBLE" | "RESERVADA" | "OCUPADA" | "LIMPIEZA" | "MANTENIMIENTO";
  limpieza?: "LIMPIA" | "SUCIA" | "EN_LIMPIEZA" | "INSPECCION";
  notas?: string | null;
  muebles?: string[];
}

export interface UpdateEstadoHabitacionDto {
  estado?: "DISPONIBLE" | "RESERVADA" | "OCUPADA" | "LIMPIEZA" | "MANTENIMIENTO";
  limpieza?: "LIMPIA" | "SUCIA" | "EN_LIMPIEZA" | "INSPECCION";
}

export type EstadoHabitacion = "DISPONIBLE" | "RESERVADA" | "OCUPADA" | "LIMPIEZA" | "MANTENIMIENTO";
export type EstadoLimpieza = "LIMPIA" | "SUCIA" | "EN_LIMPIEZA" | "INSPECCION";

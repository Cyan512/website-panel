import type { TipoHabitacion } from "@/features/rooms/types";

export interface CanalOutput {
  id: string;
  nombre: string;
}

export interface TipoHabitacionOutput {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface TarifaOutput {
  id: string;
  tipo_habitacion: TipoHabitacion;
  canal: CanalOutput;
  precio_noche: number;
  iva: number | null;
  cargo_servicios: number | null;
  moneda: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTarifaInput {
  tipo_habitacion_id: string;
  canal_id: string;
  precio_noche: number;
  iva?: number;
  cargo_servicios?: number;
  moneda?: string;
}

export interface UpdateTarifaInput {
  tipo_habitacion_id?: string;
  canal_id?: string;
  precio_noche?: number;
  iva?: number;
  cargo_servicios?: number;
  moneda?: string;
}

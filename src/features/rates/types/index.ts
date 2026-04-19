import type { TipoHabitacion } from "@/features/rooms/types";
import type { Canal } from "@/features/channels/types";

export interface Tarifa {
  id: string;
  tipo_habitacion: TipoHabitacion;
  canal: Canal;
  precio: number;
  unidad: string;
  iva: number | null;
  cargo_servicios: number | null;
  moneda: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTarifa {
  tipo_habitacion_id: string;
  canal_id: string;
  precio: number;
  unidad?: string;
  iva?: number | null;
  cargo_servicios?: number | null;
  moneda?: string;
}

export interface UpdateTarifa {
  tipo_habitacion_id?: string;
  canal_id?: string;
  precio?: number;
  unidad?: string;
  iva?: number | null;
  cargo_servicios?: number | null;
  moneda?: string;
}

import type { Canal } from "@/features/channels/types";
import type { TipoHabitacion } from "@/features/rooms/types";

export interface Tarifa {
  id: string;
  tipo_habitacion: TipoHabitacion;
  canal: Canal;
  precio_noche: number;
  iva: number | null;
  cargo_servicios: number | null;
  moneda: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTarifa {
  tipo_habitacion_id: string;
  canal_id: string;
  precio_noche: number;
  iva?: number;
  cargo_servicios?: number;
  moneda?: string;
}

export interface UpdateTarifa {
  tipo_habitacion_id?: string;
  canal_id?: string;
  precio_noche?: number;
  iva?: number;
  cargo_servicios?: number;
  moneda?: string;
}

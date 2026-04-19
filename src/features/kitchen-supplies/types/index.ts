// Shared enums live in bar-supplies — re-export for convenience
export { UnidadInsumo, TipoMovimiento, MotivoEntrada, MotivoSalida } from "@/features/bar-supplies/types";

import type { UnidadInsumo, TipoMovimiento, MotivoEntrada, MotivoSalida } from "@/features/bar-supplies/types";

export interface InsumoCocina {
  id: string;
  codigo: string;
  nombre: string;
  unidad: UnidadInsumo;
  stock_actual: number;
  stock_minimo: number;
  activo: boolean;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInsumoCocina {
  codigo: string;
  nombre: string;
  unidad: UnidadInsumo;
  stock_actual?: number;
  stock_minimo?: number;
  notas?: string;
}

export interface UpdateInsumoCocina {
  codigo?: string;
  nombre?: string;
  unidad?: UnidadInsumo;
  stock_actual?: number;
  stock_minimo?: number;
  notas?: string;
  activo?: boolean;
}

export interface MovimientoCocina {
  id: string;
  insumo_id: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo_entrada: MotivoEntrada | null;
  motivo_salida: MotivoSalida | null;
  notas: string | null;
  created_at: string;
}

export interface CreateMovimientoCocina {
  insumo_id: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo_entrada?: MotivoEntrada;
  motivo_salida?: MotivoSalida;
  notas?: string;
}

export interface MovimientoCocinaFilters {
  insumo_id?: string;
  tipo?: TipoMovimiento;
  fecha_inicio?: string;
  fecha_fin?: string;
}

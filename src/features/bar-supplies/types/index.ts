export enum UnidadInsumo {
  Unidad = "UNIDAD",
  Litro = "LITRO",
  Kg = "KG",
  Gr = "GR",
  Botella = "BOTELLA",
  Caja = "CAJA",
  Fco = "FCO",
  Saco = "SACO",
  Tubo = "TUBO",
  Blister = "BLISTER",
  Paquete = "PAQUETE",
}

export enum TipoMovimiento {
  Entrada = "ENTRADA",
  Salida = "SALIDA",
}

export enum MotivoEntrada {
  Compra = "COMPRA",
  Donacion = "DONACION",
  Ajuste = "AJUSTE",
  Reposicion = "REPOSICION",
}

export enum MotivoSalida {
  Consumo = "CONSUMO",
  Deshecho = "DESECHO",
  Ajuste = "AJUSTE",
  StockMinimo = "STOCK_MINIMO",
}

export interface InsumoBar {
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

export interface CreateInsumoBar {
  codigo: string;
  nombre: string;
  unidad: UnidadInsumo;
  stock_actual?: number;
  stock_minimo?: number;
  notas?: string;
}

export interface UpdateInsumoBar {
  codigo?: string;
  nombre?: string;
  unidad?: UnidadInsumo;
  stock_actual?: number;
  stock_minimo?: number;
  notas?: string;
  activo?: boolean;
}

export interface MovimientoBar {
  id: string;
  insumo_id: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo_entrada: MotivoEntrada | null;
  motivo_salida: MotivoSalida | null;
  notas: string | null;
  created_at: string;
}

export interface CreateMovimientoBar {
  insumo_id: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo_entrada?: MotivoEntrada;
  motivo_salida?: MotivoSalida;
  notas?: string;
}

export interface MovimientoBarFilters {
  insumo_id?: string;
  tipo?: TipoMovimiento;
  fecha_inicio?: string;
  fecha_fin?: string;
}

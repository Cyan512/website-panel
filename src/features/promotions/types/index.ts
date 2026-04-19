export interface Promocion {
  id: string;
  codigo: string;
  tipo_descuento: "PORCENTAJE" | "MONTO_FIJO";
  valor_descuento: number;
  vig_desde: string;
  vig_hasta: string;
  estado: boolean;
  habitaciones: string[];
  created_at: string;
  updated_at: string;
}

export interface CreatePromocion {
  codigo: string;
  tipo_descuento: "PORCENTAJE" | "MONTO_FIJO";
  valor_descuento: number;
  vig_desde: Date;
  vig_hasta: Date;
  estado?: boolean;
  habitaciones?: string[];
}

export interface UpdatePromocion {
  codigo?: string;
  tipo_descuento?: "PORCENTAJE" | "MONTO_FIJO";
  valor_descuento?: number;
  vig_desde?: Date;
  vig_hasta?: Date;
  estado?: boolean;
  habitaciones?: string[];
}

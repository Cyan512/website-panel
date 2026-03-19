export const ConceptoPago = {
  RESERVA: "RESERVA",
  CONSUMO: "CONSUMO",
} as const;

export type ConceptoPago = (typeof ConceptoPago)[keyof typeof ConceptoPago];

export const EstadoPago = {
  CONFIRMADO: "CONFIRMADO",
  APLICADO: "APLICADO",
  DEVUELTO: "DEVUELTO",
  RETENIDO: "RETENIDO",
  ANULADO: "ANULADO",
} as const;

export type EstadoPago = (typeof EstadoPago)[keyof typeof EstadoPago];

export const MetodoPago = {
  EFECTIVO: "EFECTIVO",
  VISA: "VISA",
  MASTERCARD: "MASTERCARD",
  AMEX: "AMEX",
  TRANSFERENCIA: "TRANSFERENCIA",
  CREDITO_AGENCIA: "CREDITO_AGENCIA",
  VOUCHER: "VOUCHER",
} as const;

export type MetodoPago = (typeof MetodoPago)[keyof typeof MetodoPago];

export const estadoPagoLabels: Record<EstadoPago, string> = {
  [EstadoPago.CONFIRMADO]: "Confirmado",
  [EstadoPago.APLICADO]: "Aplicado",
  [EstadoPago.DEVUELTO]: "Devuelto",
  [EstadoPago.RETENIDO]: "Retenido",
  [EstadoPago.ANULADO]: "Anulado",
};

export const metodoPagoLabels: Record<MetodoPago, string> = {
  [MetodoPago.EFECTIVO]: "Efectivo",
  [MetodoPago.VISA]: "Visa",
  [MetodoPago.MASTERCARD]: "Mastercard",
  [MetodoPago.AMEX]: "American Express",
  [MetodoPago.TRANSFERENCIA]: "Transferencia",
  [MetodoPago.CREDITO_AGENCIA]: "Crédito Agencia",
  [MetodoPago.VOUCHER]: "Voucher",
};

export interface RecibidoPor {
  id: string;
  codigo: string;
  nombres: string;
  apellidos: string;
}

export interface Pago {
  id: string;
  concepto: ConceptoPago;
  estado: EstadoPago;
  fecha_pago: Date;
  monto: string;
  moneda: string;
  metodo: MetodoPago;
  recibido_por_id: string | null;
  recibido_por: RecibidoPor | null;
  notas: string | null;
  created_at: Date;
}

export interface CreatePagoDto {
  concepto: ConceptoPago;
  estado?: EstadoPago;
  fecha_pago?: string | null;
  monto: number;
  moneda?: string;
  metodo: MetodoPago;
  recibido_por_id?: string | null;
  notas?: string | null;
}

export interface UpdatePagoDto {
  concepto?: ConceptoPago;
  estado?: EstadoPago;
  fecha_pago?: string | null;
  monto?: number;
  moneda?: string;
  metodo?: MetodoPago;
  recibido_por_id?: string | null;
  notas?: string | null;
}

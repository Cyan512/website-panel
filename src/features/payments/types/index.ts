export type ConceptoPago = "RESERVA" | "CONSUMO";

export type EstadoPago = "CONFIRMADO" | "DEVUELTO" | "RETENIDO" | "ANULADO";

export type MetodoPago = "EFECTIVO" | "VISA" | "MASTERCARD" | "AMEX" | "TRANSFERENCIA";

export const estadoPagoLabels: Record<EstadoPago, string> = {
  CONFIRMADO: "Confirmado",
  DEVUELTO: "Devuelto",
  RETENIDO: "Retenido",
  ANULADO: "Anulado",
};

export const metodoPagoLabels: Record<MetodoPago, string> = {
  EFECTIVO: "Efectivo",
  VISA: "Visa",
  MASTERCARD: "Mastercard",
  AMEX: "American Express",
  TRANSFERENCIA: "Transferencia",
};

export interface RecibidoPor {
  id: string;
  name: string;
  email: string;
}

export interface Pago {
  id: string;
  concepto: ConceptoPago;
  estado: EstadoPago;
  fecha_pago: string;
  monto: string;
  moneda: string;
  metodo: MetodoPago;
  recibido_por_id: string | null;
  recibido_por: RecibidoPor | null;
  observacion: string | null;
  created_at: string;
}

export interface CreatePago {
  concepto: ConceptoPago;
  estado?: EstadoPago;
  fecha_pago?: string | null;
  monto: number;
  moneda?: string;
  metodo: MetodoPago;
  recibido_por_id?: string | null;
  observacion?: string | null;
}

export interface UpdatePago {
  concepto?: ConceptoPago;
  estado?: EstadoPago;
  fecha_pago?: string | null;
  monto?: number;
  moneda?: string;
  metodo?: MetodoPago;
  recibido_por_id?: string | null;
  observacion?: string | null;
}

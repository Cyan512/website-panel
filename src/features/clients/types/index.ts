export type TipoDocumento  = "DNI" | "PASAPORTE" | "RUC" | "CE"

export interface Huesped {
  id: string;
  tipo_doc?: string;
  nro_doc?: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  nacionalidad: string;
  observacion: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateHuespedDto {
  tipo_doc?: string;
  nro_doc?: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  nacionalidad: string;
  observacion: string | null;
}

export interface UpdateHuespedDto {
  tipo_doc?: string;
  nro_doc?: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  nacionalidad: string;
  observacion: string | null;
}

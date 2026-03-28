export type TipoDocumento = "DNI" | "PASAPORTE" | "RUC" | "CE";

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

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedHuespedes {
  list: Huesped[];
  pagination: PaginationMeta;
}

export interface CreateHuesped {
  tipo_doc?: string;
  nro_doc?: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  nacionalidad: string;
  observacion: string | null;
}

export interface UpdateHuesped {
  tipo_doc?: string;
  nro_doc?: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  nacionalidad: string;
  observacion: string | null;
}

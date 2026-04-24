export type MuebleCondition = "BUENO" | "REGULAR" | "DANADO" | "FALTANTE";
export type { CategoriaMueble, CreateCategoriaMueble } from "@/features/furniture-categories/types";

export const muebleConditionLabels: Record<MuebleCondition, string> = {
  BUENO: "Bueno",
  REGULAR: "Regular",
  DANADO: "Dañado",
  FALTANTE: "Faltante",
};

export const muebleConditionColors: Record<MuebleCondition, string> = {
  BUENO: "bg-success-bg text-success",
  REGULAR: "bg-warning-bg text-warning",
  DANADO: "bg-danger-bg text-danger",
  FALTANTE: "bg-bg-tertiary text-text-muted",
};

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedMuebles {
  list: Mueble[];
  pagination: PaginationMeta;
}

export interface Mueble {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoria_id: string | null;
  categoria?: {
    id: string;
    nombre: string;
    descripcion: string | null;
    activo: boolean;
    created_at: string;
    updated_at: string;
  };
  url_imagen: string | null;
  imagenes?: string[];
  condicion: MuebleCondition;
  fecha_adquisicion: string | null;
  ultima_revision: string | null;
  habitacion_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMueble {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria_id?: string;
  imagen?: File[];
  condicion?: MuebleCondition;
  fecha_adquisicion?: string;
  ultima_revision?: string;
  habitacion_id?: string;
}

export interface UpdateMueble {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  categoria_id?: string;
  imagen?: File[];
  condicion?: MuebleCondition;
  fecha_adquisicion?: string;
  ultima_revision?: string;
  habitacion_id?: string;
  remove_imagen?: boolean;
}

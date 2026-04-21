export type MuebleCondition = "BUENO" | "REGULAR" | "DANADO" | "FALTANTE";

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

export interface Mueble {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoria_id: string;
  imagen_url: string | null;
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
  categoria_id: string;
  imagen?: File[];
  condicion?: MuebleCondition;
  fecha_adquisicion?: string;
  ultima_revision?: string;
  habitacion_id: string;
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
}

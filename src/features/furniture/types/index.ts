export type MuebleCondition = "BUENO" | "REGULAR" | "DANADO" | "FALTANTE";

export const muebleConditionLabels: Record<MuebleCondition, string> = {
  BUENO: "Bueno",
  REGULAR: "Regular",
  DANADO: "Dañado",
  FALTANTE: "Faltante",
};

export const muebleConditionColors: Record<MuebleCondition, string> = {
  BUENO: "bg-emerald-500 text-emerald-100",
  REGULAR: "bg-amber-500 text-amber-100",
  DANADO: "bg-red-500 text-red-100",
  FALTANTE: "bg-blue-500 text-blue-100",
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
  imagen_url?: string;
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
  imagen_url?: string;
  condicion?: MuebleCondition;
  fecha_adquisicion?: string;
  ultima_revision?: string;
  habitacion_id?: string;
}

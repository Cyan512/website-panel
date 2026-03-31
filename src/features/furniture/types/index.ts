export type MuebleCondition = "BUENO" | "REGULAR" | "DANADO" | "FALTANTE";

export const muebleConditionLabels: Record<MuebleCondition, string> = {
  BUENO: "Bueno",
  REGULAR: "Regular",
  DANADO: "Dañado",
  FALTANTE: "Faltante",
};

export const muebleConditionColors: Record<MuebleCondition, string> = {
  BUENO: "bg-emerald-100 text-emerald-700",
  REGULAR: "bg-amber-100 text-amber-700",
  DANADO: "bg-red-100 text-red-700",
  FALTANTE: "bg-blue-100 text-blue-700",
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

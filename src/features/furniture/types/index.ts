export type MuebleCondition = "NUEVO" | "BUENO" | "REGULAR" | "MALO" | "BAJA";

export const muebleConditionLabels: Record<MuebleCondition, string> = {
  NUEVO: "Nuevo",
  BUENO: "Bueno",
  REGULAR: "Regular",
  MALO: "Malo",
  BAJA: "Baja",
};

export const muebleConditionColors: Record<MuebleCondition, string> = {
  NUEVO: "bg-emerald-100 text-emerald-700",
  BUENO: "bg-blue-100 text-blue-700",
  REGULAR: "bg-amber-100 text-amber-700",
  MALO: "bg-orange-100 text-orange-700",
  BAJA: "bg-red-100 text-red-700",
};

export interface CategoriaOutput {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface MuebleOutput {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoria_id: string;
  categoria: CategoriaOutput | null;
  imagen_url: string | null;
  condicion: MuebleCondition;
  fecha_adquisicion: string | null;
  ultima_revision: string | null;
  habitacion_id: string | null;
  habitacion: { id: string; nro_habitacion: string; piso: number } | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMuebleInput {
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

export interface UpdateMuebleInput {
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

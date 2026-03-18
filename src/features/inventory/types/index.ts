export const MuebleCategoria = {
  CAMA: "CAMA",
  ASIENTO: "ASIENTO",
  ALMACENAJE: "ALMACENAJE",
  TECNOLOGIA: "TECNOLOGIA",
  BANO: "BANO",
  DECORACION: "DECORACION",
  OTRO: "OTRO",
} as const;

export type MuebleCategoria = (typeof MuebleCategoria)[keyof typeof MuebleCategoria];

export const MuebleCondicion = {
  BUENO: "BUENO",
  REGULAR: "REGULAR",
  DANADO: "DANADO",
  FALTANTE: "FALTANTE",
} as const;

export type MuebleCondicion = (typeof MuebleCondicion)[keyof typeof MuebleCondicion];

export interface Mueble {
  id: string;
  codigo: string;
  nombre: string;
  categoria: MuebleCategoria;
  imagen_url: string | null;
  tipo: string | null;
  condicion: MuebleCondicion;
  fecha_adquisicion: string | null;
  ultima_revision: string | null;
  descripcion: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateMuebleDto {
  codigo: string;
  nombre: string;
  categoria: MuebleCategoria;
  imagen_url?: string | null;
  tipo?: string | null;
  condicion?: MuebleCondicion;
  fecha_adquisicion?: string | null;
  ultima_revision?: string | null;
  descripcion?: string | null;
}

export interface UpdateMuebleDto {
  codigo?: string;
  nombre?: string;
  categoria?: MuebleCategoria;
  imagen_url?: string | null;
  tipo?: string | null;
  condicion?: MuebleCondicion;
  fecha_adquisicion?: string | null;
  ultima_revision?: string | null;
  descripcion?: string | null;
}

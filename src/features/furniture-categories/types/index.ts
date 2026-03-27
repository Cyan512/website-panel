export interface CategoriaMuebleOutputDto {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoriaMuebleDto {
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface UpdateCategoriaMuebleDto {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

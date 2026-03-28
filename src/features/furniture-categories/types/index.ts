export interface CategoriaMueble {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoriaMueble {
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface UpdateCategoriaMueble {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface CategoriaMueble {
  id: string;
  nombre: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoriaMueble {
  nombre: string;
}

export interface UpdateCategoriaMueble {
  nombre?: string;
}
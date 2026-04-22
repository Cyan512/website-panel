export interface TipoHabitacion {
  id: string;
  nombre: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateTipoHabitacion {
  nombre: string;
}

export interface UpdateTipoHabitacion {
  nombre?: string;
}

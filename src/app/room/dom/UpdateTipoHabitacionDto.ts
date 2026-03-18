export interface UpdateTipoHabitacionDto {
  nombre?: string;
  descripcion?: string | null;
  tiene_ducha?: boolean;
  tiene_banio?: boolean;
  muebles?: string[];
}

export interface DeleteTipoHabitacionRepositoryPort {
  delete(id: string): Promise<void>;
}

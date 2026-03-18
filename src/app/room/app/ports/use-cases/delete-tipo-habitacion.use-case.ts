export interface DeleteTipoHabitacionUseCase {
  execute(id: string): Promise<void>;
}

export interface DeleteHabitacionUseCase {
  execute(id: string): Promise<void>;
}

export interface DeleteMuebleUseCase {
  execute(id: string): Promise<void>;
}

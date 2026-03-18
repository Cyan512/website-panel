import axiosInstance from "@/config/axios/axios.instance";
import type { DeleteTipoHabitacionRepositoryPort } from "@/app/room/app/ports/output/delete-tipo-habitacion-repository.port";

export class DeleteTipoHabitacionRepository implements DeleteTipoHabitacionRepositoryPort {
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/api/tipos-habitacion/${id}`);
  }
}

export const deleteTipoHabitacionRepository = new DeleteTipoHabitacionRepository();

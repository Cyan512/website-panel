import axiosInstance from "@/config/axios/axios.instance";
import type { DeleteHabitacionRepositoryPort } from "@/app/room/app/ports/output/delete-habitacion-repository.port";

export class DeleteHabitacionRepository implements DeleteHabitacionRepositoryPort {
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/api/habitaciones/${id}`);
  }
}

export const deleteHabitacionRepository = new DeleteHabitacionRepository();

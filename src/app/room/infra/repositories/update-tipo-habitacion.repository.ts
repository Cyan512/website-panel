import axiosInstance from "@/config/axios/axios.instance";
import type { TipoHabitacion } from "@/app/room/dom/TipoHabitacion";
import type { UpdateTipoHabitacionDto } from "@/app/room/dom/UpdateTipoHabitacionDto";
import type { UpdateTipoHabitacionRepositoryPort } from "@/app/room/app/ports/output/update-tipo-habitacion-repository.port";

export class UpdateTipoHabitacionRepository implements UpdateTipoHabitacionRepositoryPort {
  async update(id: string, data: UpdateTipoHabitacionDto): Promise<TipoHabitacion> {
    const response = await axiosInstance.put<{ data: TipoHabitacion }>(`/api/tipos-habitacion/${id}`, data);
    return response.data.data;
  }
}

export const updateTipoHabitacionRepository = new UpdateTipoHabitacionRepository();

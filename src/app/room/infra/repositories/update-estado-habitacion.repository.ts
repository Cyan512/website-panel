import axiosInstance from "@/config/axios/axios.instance";
import type { Habitacion } from "@/app/room/dom/Habitacion";
import type { UpdateEstadoHabitacionDto } from "@/app/room/dom/Habitacion";
import type { UpdateEstadoHabitacionRepositoryPort } from "@/app/room/app/ports/output/update-estado-habitacion-repository.port";

export class UpdateEstadoHabitacionRepository implements UpdateEstadoHabitacionRepositoryPort {
  async updateEstado(id: string, data: UpdateEstadoHabitacionDto): Promise<Habitacion> {
    const response = await axiosInstance.patch<{ data: Habitacion }>(`/api/habitaciones/${id}/estado`, data);
    return response.data.data;
  }
}

export const updateEstadoHabitacionRepository = new UpdateEstadoHabitacionRepository();

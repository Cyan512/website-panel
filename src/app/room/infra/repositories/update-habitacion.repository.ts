import axiosInstance from "@/config/axios/axios.instance";
import type { Habitacion } from "@/app/room/dom/Habitacion";
import type { UpdateHabitacionDto } from "@/app/room/dom/Habitacion";
import type { UpdateHabitacionRepositoryPort } from "@/app/room/app/ports/output/update-habitacion-repository.port";

export class UpdateHabitacionRepository implements UpdateHabitacionRepositoryPort {
  async update(id: string, data: UpdateHabitacionDto): Promise<Habitacion> {
    const response = await axiosInstance.put<{ data: Habitacion }>(`/api/habitaciones/${id}`, data);
    return response.data.data;
  }
}

export const updateHabitacionRepository = new UpdateHabitacionRepository();

import axiosInstance from "@/config/axios/axios.instance";
import type { TipoHabitacion } from "@/app/room/dom/TipoHabitacion";
import type { TiposHabitacionRepositoryPort } from "@/app/room/app/ports/output/tipos-habitacion-repository.port";

export class GetTiposHabitacionRepository implements TiposHabitacionRepositoryPort {
  async getAll(): Promise<TipoHabitacion[]> {
    const response = await axiosInstance.get<{ data: TipoHabitacion[] }>("/api/tipos-habitacion");
    return response.data.data;
  }

  async getById(id: string): Promise<TipoHabitacion> {
    const response = await axiosInstance.get<{ data: TipoHabitacion }>(`/api/tipos-habitacion/${id}`);
    return response.data.data;
  }
}

export const getTiposHabitacionRepository = new GetTiposHabitacionRepository();

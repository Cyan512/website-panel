import axiosInstance from "@/config/axios/axios.instance";
import type { TipoHabitacion } from "@/app/room/dom/TipoHabitacion";
import type { CreateTipoHabitacionDto } from "@/app/room/dom/CreateTipoHabitacionDto";
import type { CreateTipoHabitacionRepositoryPort } from "@/app/room/app/ports/output/create-tipo-habitacion-repository.port";

export class CreateTipoHabitacionRepository implements CreateTipoHabitacionRepositoryPort {
  async create(data: CreateTipoHabitacionDto): Promise<TipoHabitacion> {
    const response = await axiosInstance.post<{ data: TipoHabitacion }>("/api/tipos-habitacion", data);
    return response.data.data;
  }
}

export const createTipoHabitacionRepository = new CreateTipoHabitacionRepository();

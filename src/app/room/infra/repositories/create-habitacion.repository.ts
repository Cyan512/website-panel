import axiosInstance from "@/config/axios/axios.instance";
import type { Habitacion } from "@/app/room/dom/Habitacion";
import type { CreateHabitacionDto } from "@/app/room/dom/CreateHabitacionDto";
import type { CreateHabitacionRepositoryPort } from "@/app/room/app/ports/output/create-habitacion-repository.port";

export class CreateHabitacionRepository implements CreateHabitacionRepositoryPort {
  async create(data: CreateHabitacionDto): Promise<Habitacion> {
    const response = await axiosInstance.post<Habitacion>("/api/habitaciones", data);
    return response.data;
  }
}

export const createHabitacionRepository = new CreateHabitacionRepository();

import axiosInstance from "@/config/axios/axios.instance";
import type { Habitacion } from "@/app/room/dom/Habitacion";
import type { CreateHabitacionDto } from "@/app/room/dom/CreateHabitacionDto";

export interface CreateHabitacionRepositoryPort {
  create(data: CreateHabitacionDto): Promise<Habitacion>;
}

export class CreateHabitacionRepository implements CreateHabitacionRepositoryPort {
  async create(data: CreateHabitacionDto): Promise<Habitacion> {
    const response = await axiosInstance.post<Habitacion>("/api/habitaciones", data);
    return response.data;
  }
}

export const createHabitacionRepository = new CreateHabitacionRepository();

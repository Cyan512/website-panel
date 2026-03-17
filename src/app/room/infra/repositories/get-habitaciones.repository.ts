import axiosInstance from "@/config/axios/axios.instance";
import type { Habitacion } from "@/app/room/dom/Habitacion";

export interface HabitacionesRepositoryPort {
  getAll(): Promise<Habitacion[]>;
}

export class GetHabitacionesRepository implements HabitacionesRepositoryPort {
  async getAll(): Promise<Habitacion[]> {
    const response = await axiosInstance.get<Habitacion[]>("/api/habitaciones");
    return response.data;
  }
}

export const getHabitacionesRepository = new GetHabitacionesRepository();

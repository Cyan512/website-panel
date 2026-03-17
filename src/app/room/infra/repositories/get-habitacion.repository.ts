import axiosInstance from "@/config/axios/axios.instance";
import type { Habitacion } from "@/app/room/dom/Habitacion";

export interface HabitacionRepositoryPort {
  getById(id: string): Promise<Habitacion>;
}

export class GetHabitacionRepository implements HabitacionRepositoryPort {
  async getById(id: string): Promise<Habitacion> {
    const response = await axiosInstance.get<Habitacion>(`/api/habitaciones/${id}`);
    return response.data;
  }
}

export const getHabitacionRepository = new GetHabitacionRepository();

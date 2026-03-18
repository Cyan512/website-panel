import axiosInstance from "@/config/axios/axios.instance";
import type { Habitacion } from "@/app/room/dom/Habitacion";
import type { HabitacionesRepositoryPort } from "@/app/room/app/ports/output/habitaciones-repository.port";

export class GetHabitacionesRepository implements HabitacionesRepositoryPort {
  async getAll(): Promise<Habitacion[]> {
    const response = await axiosInstance.get<{ data: Habitacion[] }>("/api/habitaciones");
    return response.data.data;
  }
}

export const getHabitacionesRepository = new GetHabitacionesRepository();

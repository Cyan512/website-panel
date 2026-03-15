import axiosInstance from "@/config/axios/axios.instance";
import type { Habitacion } from "@/models/Habitacion";

export interface CreateHabitacionDto {
  numero: string;
  piso: number;
  tipo: string;
  precio: number;
}

export const roomService = {
  getAll: async (): Promise<Habitacion[]> => {
    const response = await axiosInstance.get<Habitacion[]>("/api/habitaciones");
    return response.data;
  },

  createRoom: async (data: CreateHabitacionDto): Promise<Habitacion> => {
    const response = await axiosInstance.post<Habitacion>("/api/habitaciones", data);
    return response.data;
  },
};
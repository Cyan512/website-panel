import axiosInstance from "@/config/axios/axios.instance";
import type { Habitacion } from "@/models/Habitacion";

export const roomService = {
  getAll: async (): Promise<Habitacion[]> => {
    const response = await axiosInstance.get<Habitacion[]>("/api/habitaciones");
    return response.data;
  },

  createRoom: async (): Promise<Habitacion> => {
    const response = await axiosInstance.post<Habitacion>("/api/habitaciones");
    return response.data;
  },
};
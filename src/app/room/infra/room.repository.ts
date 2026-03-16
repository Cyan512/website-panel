import axiosInstance from "@/config/axios/axios.instance";
import type { Habitacion } from "@/app/room/dom/Habitacion";
import type { CreateHabitacionDto } from "@/app/room/dom/CreateHabitacionDto";
import type { RoomPort } from "@/app/room/app/room.port";

export const roomRepository: RoomPort = {
  getAll: async (): Promise<Habitacion[]> => {
    const response = await axiosInstance.get<Habitacion[]>("/api/habitaciones");
    return response.data;
  },

  getById: async (id: string): Promise<Habitacion> => {
    const response = await axiosInstance.get<Habitacion>(`/api/habitaciones/${id}`);
    return response.data;
  },

  create: async (data: CreateHabitacionDto): Promise<Habitacion> => {
    const response = await axiosInstance.post<Habitacion>("/api/habitaciones", data);
    return response.data;
  },
};

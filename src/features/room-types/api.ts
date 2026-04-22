import axiosInstance from "@/shared/lib/axios";
import type { TipoHabitacion, CreateTipoHabitacion, UpdateTipoHabitacion } from "./types";

export const tiposHabitacionApi = {
  getAll: async (): Promise<TipoHabitacion[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: TipoHabitacion[] }>("/api/private/tipos-habitacion");
    return response.data.data;
  },

  create: async (data: CreateTipoHabitacion): Promise<TipoHabitacion> => {
    const response = await axiosInstance.post<{ success: boolean; data: TipoHabitacion }>("/api/private/tipos-habitacion", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateTipoHabitacion): Promise<TipoHabitacion> => {
    const response = await axiosInstance.put<{ success: boolean; data: TipoHabitacion }>(`/api/private/tipos-habitacion/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/private/tipos-habitacion/${id}`);
  },
};

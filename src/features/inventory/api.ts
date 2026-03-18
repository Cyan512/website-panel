import axiosInstance from "@/config/axios/axios.instance";
import type { Mueble, CreateMuebleDto, UpdateMuebleDto } from "./types";

export const inventoryApi = {
  getAll: async (): Promise<Mueble[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: Mueble[] }>("/api/catalogo-muebles");
    return response.data.data;
  },

  getById: async (id: string): Promise<Mueble> => {
    const response = await axiosInstance.get<{ success: boolean; data: Mueble }>(`/api/catalogo-muebles/${id}`);
    return response.data.data;
  },

  create: async (data: CreateMuebleDto): Promise<Mueble> => {
    const response = await axiosInstance.post<{ success: boolean; data: Mueble }>("/api/catalogo-muebles", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateMuebleDto): Promise<Mueble> => {
    const response = await axiosInstance.put<{ success: boolean; data: Mueble }>(`/api/catalogo-muebles/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/catalogo-muebles/${id}`);
  },
};

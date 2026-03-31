import axiosInstance from "@/config/axios/axios.instance";
import type { CategoriaMueble, CreateCategoriaMueble, UpdateCategoriaMueble } from "./types";

export const categoriasMuebleApi = {
  getAll: async (): Promise<CategoriaMueble[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: CategoriaMueble[] }>("/api/private/categorias-mueble");
    return response.data.data;
  },

  create: async (data: CreateCategoriaMueble): Promise<CategoriaMueble> => {
    const response = await axiosInstance.post<{ success: boolean; data: CategoriaMueble }>("/api/private/categorias-mueble", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateCategoriaMueble): Promise<CategoriaMueble> => {
    const response = await axiosInstance.put<{ success: boolean; data: CategoriaMueble }>(`/api/private/categorias-mueble/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/private/categorias-mueble/${id}`);
  },
};

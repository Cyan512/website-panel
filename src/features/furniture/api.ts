import axiosInstance from "@/config/axios/axios.instance";
import type { Mueble, CreateMueble, UpdateMueble } from "./types";
import type { CategoriaMueble } from "../furniture-categories/types";

export const mueblesApi = {
  getAll: async (): Promise<Mueble[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: Mueble[] }>("/api/private/muebles");
    return response.data.data;
  },

  getById: async (id: string): Promise<Mueble> => {
    const response = await axiosInstance.get<{ success: boolean; data: Mueble }>(`/api/private/muebles/${id}`);
    return response.data.data;
  },

  create: async (data: CreateMueble): Promise<Mueble> => {
    const response = await axiosInstance.post<{ success: boolean; data: Mueble }>("/api/private/muebles", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateMueble): Promise<Mueble> => {
    const response = await axiosInstance.put<{ success: boolean; data: Mueble }>(`/api/private/muebles/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/private/muebles/${id}`);
  },
};

export const categoriasApi = {
  getAll: async (): Promise<CategoriaMueble[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: CategoriaMueble[] }>("/api/private/categorias-mueble");
    return response.data.data;
  },
};

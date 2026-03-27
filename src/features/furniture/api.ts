import axiosInstance from "@/config/axios/axios.instance";
import type { MuebleOutput, CreateMuebleInput, UpdateMuebleInput, CategoriaOutput } from "./types";

export const mueblesApi = {
  getAll: async (): Promise<MuebleOutput[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: MuebleOutput[] }>("/api/muebles");
    return response.data.data;
  },

  getById: async (id: string): Promise<MuebleOutput> => {
    const response = await axiosInstance.get<{ success: boolean; data: MuebleOutput }>(`/api/muebles/${id}`);
    return response.data.data;
  },

  create: async (data: CreateMuebleInput): Promise<MuebleOutput> => {
    const response = await axiosInstance.post<{ success: boolean; data: MuebleOutput }>("/api/muebles", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateMuebleInput): Promise<MuebleOutput> => {
    const response = await axiosInstance.put<{ success: boolean; data: MuebleOutput }>(`/api/muebles/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/muebles/${id}`);
  },
};

export const categoriasApi = {
  getAll: async (): Promise<CategoriaOutput[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: CategoriaOutput[] }>("/api/categorias-mueble");
    return response.data.data;
  },
};

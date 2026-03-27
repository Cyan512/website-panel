import axiosInstance from "@/config/axios/axios.instance";
import type { CategoriaMuebleOutputDto, CreateCategoriaMuebleDto, UpdateCategoriaMuebleDto } from "./types";

export const categoriasMuebleApi = {
  getAll: async (): Promise<CategoriaMuebleOutputDto[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: CategoriaMuebleOutputDto[] }>("/api/categorias-mueble");
    return response.data.data;
  },

  create: async (data: CreateCategoriaMuebleDto): Promise<CategoriaMuebleOutputDto> => {
    const response = await axiosInstance.post<{ success: boolean; data: CategoriaMuebleOutputDto }>("/api/categorias-mueble", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateCategoriaMuebleDto): Promise<CategoriaMuebleOutputDto> => {
    const response = await axiosInstance.put<{ success: boolean; data: CategoriaMuebleOutputDto }>(`/api/categorias-mueble/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/categorias-mueble/${id}`);
  },
};

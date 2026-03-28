import axiosInstance from "@/config/axios/axios.instance";
import type { Huesped, CreateHuespedDto, UpdateHuespedDto, PaginatedHuespedes } from "./types";

export const huespedesApi = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedHuespedes> => {
    const response = await axiosInstance.get<{ success: boolean; data: PaginatedHuespedes }>(
      `/api/huespedes?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Huesped> => {
    const response = await axiosInstance.get<{ success: boolean; data: Huesped }>(`/api/huespedes/${id}`);
    return response.data.data;
  },

  create: async (data: CreateHuespedDto): Promise<Huesped> => {
    const response = await axiosInstance.post<{ success: boolean; data: Huesped }>("/api/huespedes", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateHuespedDto): Promise<Huesped> => {
    const response = await axiosInstance.put<{ success: boolean; data: Huesped }>(`/api/huespedes/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/huespedes/${id}`);
  },
};

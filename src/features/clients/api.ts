import axiosInstance from "@/shared/lib/axios";
import type { Huesped, CreateHuesped, UpdateHuesped, PaginatedHuespedes } from "./types";

export const huespedesApi = {
  getAll: async (page = 1, limit = 10, name?: string): Promise<PaginatedHuespedes> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (name) params.set("name", name);
    const response = await axiosInstance.get<{ success: boolean; data: PaginatedHuespedes }>(
      `/api/private/huespedes?${params.toString()}`
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Huesped> => {
    const response = await axiosInstance.get<{ success: boolean; data: Huesped }>(`/api/private/huespedes/${id}`);
    return response.data.data;
  },

  create: async (data: CreateHuesped): Promise<Huesped> => {
    const response = await axiosInstance.post<{ success: boolean; data: Huesped }>("/api/private/huespedes", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateHuesped): Promise<Huesped> => {
    const response = await axiosInstance.put<{ success: boolean; data: Huesped }>(`/api/private/huespedes/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/private/huespedes/${id}`);
  },
};

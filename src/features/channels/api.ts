import axiosInstance from "@/shared/lib/axios";
import type { Canal, CreateCanal, UpdateCanal } from "./types";

export const canalesApi = {
  getAll: async (): Promise<Canal[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: Canal[] }>("/api/private/canales");
    return response.data.data;
  },

  getById: async (id: string): Promise<Canal> => {
    const response = await axiosInstance.get<{ success: boolean; data: Canal }>(`/api/private/canales/${id}`);
    return response.data.data;
  },

  create: async (data: CreateCanal): Promise<Canal> => {
    const response = await axiosInstance.post<{ success: boolean; data: Canal }>("/api/private/canales", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateCanal): Promise<Canal> => {
    const response = await axiosInstance.put<{ success: boolean; data: Canal }>(`/api/private/canales/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/private/canales/${id}`);
  },
};

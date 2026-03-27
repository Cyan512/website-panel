import axiosInstance from "@/config/axios/axios.instance";
import type { CanalOutput, CreateCanalInput, UpdateCanalInput } from "./types";

export const canalesApi = {
  getAll: async (): Promise<CanalOutput[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: CanalOutput[] }>("/api/canales");
    return response.data.data;
  },

  getById: async (id: string): Promise<CanalOutput> => {
    const response = await axiosInstance.get<{ success: boolean; data: CanalOutput }>(`/api/canales/${id}`);
    return response.data.data;
  },

  create: async (data: CreateCanalInput): Promise<CanalOutput> => {
    const response = await axiosInstance.post<{ success: boolean; data: CanalOutput }>("/api/canales", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateCanalInput): Promise<CanalOutput> => {
    const response = await axiosInstance.put<{ success: boolean; data: CanalOutput }>(`/api/canales/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/canales/${id}`);
  },
};

import axiosInstance from "@/shared/lib/axios";
import type { Tarifa, CreateTarifa, UpdateTarifa } from "./types";
import type { Canal, CreateCanal, UpdateCanal } from "@/features/channels/types";

export const tarifasApi = {
  getAll: async (): Promise<Tarifa[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: Tarifa[] }>("/api/private/tarifas");
    return response.data.data;
  },

  getById: async (id: string): Promise<Tarifa> => {
    const response = await axiosInstance.get<{ success: boolean; data: Tarifa }>(`/api/private/tarifas/${id}`);
    return response.data.data;
  },

  create: async (data: CreateTarifa): Promise<Tarifa> => {
    const response = await axiosInstance.post<{ success: boolean; data: Tarifa }>("/api/private/tarifas", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateTarifa): Promise<Tarifa> => {
    const response = await axiosInstance.put<{ success: boolean; data: Tarifa }>(`/api/private/tarifas/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/private/tarifas/${id}`);
  },
};

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

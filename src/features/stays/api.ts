import axiosInstance from "@/config/axios/axios.instance";
import type { Estancia, CreateEstancia, UpdateEstancia, CheckoutEstancia } from "./types";

export const estanciasApi = {
  getAll: async (): Promise<Estancia[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: Estancia[] }>("/api/estancias");
    return response.data.data;
  },

  getById: async (id: string): Promise<Estancia> => {
    const response = await axiosInstance.get<{ success: boolean; data: Estancia }>(`/api/estancias/${id}`);
    return response.data.data;
  },

  create: async (data: CreateEstancia): Promise<Estancia> => {
    const response = await axiosInstance.post<{ success: boolean; data: Estancia }>("/api/estancias", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateEstancia): Promise<Estancia> => {
    const response = await axiosInstance.put<{ success: boolean; data: Estancia }>(`/api/estancias/${id}`, data);
    return response.data.data;
  },

  checkout: async (id: string, data: CheckoutEstancia): Promise<Estancia> => {
    const response = await axiosInstance.patch<{ success: boolean; data: Estancia }>(`/api/estancias/${id}/checkout`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/estancias/${id}`);
  },
};

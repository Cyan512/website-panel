import axiosInstance from "@/shared/lib/axios";
import type { Pago, CreatePago, UpdatePago } from "./types";

export const pagosApi = {
  getAll: async (): Promise<Pago[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: Pago[] }>("/api/private/pagos");
    return response.data.data;
  },

  getById: async (id: string): Promise<Pago> => {
    const response = await axiosInstance.get<{ success: boolean; data: Pago }>(`/api/private/pagos/${id}`);
    return response.data.data;
  },

  create: async (data: CreatePago): Promise<Pago> => {
    const response = await axiosInstance.post<{ success: boolean; data: Pago }>("/api/private/pagos", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdatePago): Promise<Pago> => {
    const response = await axiosInstance.put<{ success: boolean; data: Pago }>(`/api/private/pagos/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/private/pagos/${id}`);
  },
};

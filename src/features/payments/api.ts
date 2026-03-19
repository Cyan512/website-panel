import axiosInstance from "@/config/axios/axios.instance";
import type { Pago, CreatePagoDto, UpdatePagoDto } from "./types";

export const pagosApi = {
  getAll: async (): Promise<Pago[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: Pago[] }>("/api/pagos");
    return response.data.data;
  },

  getById: async (id: string): Promise<Pago> => {
    const response = await axiosInstance.get<{ success: boolean; data: Pago }>(`/api/pagos/${id}`);
    return response.data.data;
  },

  create: async (data: CreatePagoDto): Promise<Pago> => {
    const response = await axiosInstance.post<{ success: boolean; data: Pago }>("/api/pagos", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdatePagoDto): Promise<Pago> => {
    const response = await axiosInstance.put<{ success: boolean; data: Pago }>(`/api/pagos/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/pagos/${id}`);
  },
};

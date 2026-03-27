import axiosInstance from "@/config/axios/axios.instance";
import type { EstanciaOutput, CreateEstanciaInput, UpdateEstanciaInput, CheckoutEstanciaInput } from "./types";

export const estanciasApi = {
  getAll: async (): Promise<EstanciaOutput[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: EstanciaOutput[] }>("/api/estancias");
    return response.data.data;
  },

  getById: async (id: string): Promise<EstanciaOutput> => {
    const response = await axiosInstance.get<{ success: boolean; data: EstanciaOutput }>(`/api/estancias/${id}`);
    return response.data.data;
  },

  create: async (data: CreateEstanciaInput): Promise<EstanciaOutput> => {
    const response = await axiosInstance.post<{ success: boolean; data: EstanciaOutput }>("/api/estancias", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateEstanciaInput): Promise<EstanciaOutput> => {
    const response = await axiosInstance.put<{ success: boolean; data: EstanciaOutput }>(`/api/estancias/${id}`, data);
    return response.data.data;
  },

  checkout: async (id: string, data: CheckoutEstanciaInput): Promise<EstanciaOutput> => {
    const response = await axiosInstance.patch<{ success: boolean; data: EstanciaOutput }>(`/api/estancias/${id}/checkout`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/estancias/${id}`);
  },
};

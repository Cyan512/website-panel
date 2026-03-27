import axiosInstance from "@/config/axios/axios.instance";
import type { ReservaOutput, CreateReservaInput, UpdateReservaInput, CancelReservaInput } from "./types";

export const reservasApi = {
  getAll: async (): Promise<ReservaOutput[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: ReservaOutput[] }>("/api/reservas");
    return response.data.data;
  },

  getById: async (id: string): Promise<ReservaOutput> => {
    const response = await axiosInstance.get<{ success: boolean; data: ReservaOutput }>(`/api/reservas/${id}`);
    return response.data.data;
  },

  create: async (data: CreateReservaInput): Promise<ReservaOutput> => {
    const response = await axiosInstance.post<{ success: boolean; data: ReservaOutput }>("/api/reservas", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateReservaInput): Promise<ReservaOutput> => {
    const response = await axiosInstance.put<{ success: boolean; data: ReservaOutput }>(`/api/reservas/${id}`, data);
    return response.data.data;
  },

  cancel: async (id: string, data: CancelReservaInput): Promise<ReservaOutput> => {
    const response = await axiosInstance.patch<{ success: boolean; data: ReservaOutput }>(`/api/reservas/${id}/cancel`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/reservas/${id}`);
  },
};

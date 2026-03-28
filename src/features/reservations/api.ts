import axiosInstance from "@/config/axios/axios.instance";
import type { Reserva, CreateReserva, UpdateReserva, CancelReserva, UpdateEstadoReserva } from "./types";

export const reservasApi = {
  getAll: async (): Promise<Reserva[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: Reserva[] }>("/api/reservas");
    return response.data.data;
  },

  getById: async (id: string): Promise<Reserva> => {
    const response = await axiosInstance.get<{ success: boolean; data: Reserva }>(`/api/reservas/${id}`);
    return response.data.data;
  },

  create: async (data: CreateReserva): Promise<Reserva> => {
    const response = await axiosInstance.post<{ success: boolean; data: Reserva }>("/api/reservas", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateReserva): Promise<Reserva> => {
    const response = await axiosInstance.put<{ success: boolean; data: Reserva }>(`/api/reservas/${id}`, data);
    return response.data.data;
  },

  updateEstado: async (id: string, data: UpdateEstadoReserva): Promise<Reserva> => {
    const response = await axiosInstance.patch<{ success: boolean; data: Reserva }>(`/api/reservas/${id}/estado`, data);
    return response.data.data;
  },

  cancel: async (id: string, data: CancelReserva): Promise<Reserva> => {
    const response = await axiosInstance.patch<{ success: boolean; data: Reserva }>(`/api/reservas/${id}/cancel`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/reservas/${id}`);
  },
};

import axiosInstance from "@/shared/lib/axios";
import type { Reserva, CreateReserva, UpdateReserva, CancelReserva, UpdateEstadoReserva, PaginatedReservas } from "./types";

export const reservasApi = {
  getAll: async (page = 1, limit = 10, nombre?: string, tipo?: string): Promise<PaginatedReservas> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (nombre) params.set("nombre", nombre);
    if (tipo) params.set("tipo", tipo);
    const response = await axiosInstance.get<{ success: boolean; data: PaginatedReservas }>(
      `/api/private/reservas?${params.toString()}`
    );
    return response.data.data;
  },

  getByNombre: async (nombre: string, signal?: AbortSignal): Promise<Reserva[]> => {
    const params = new URLSearchParams({ nombre });
    const response = await axiosInstance.get<{ success: boolean; data: PaginatedReservas }>(
      `/api/private/reservas?${params.toString()}`,
      { signal }
    );
    return response.data.data.list;
  },

  getById: async (id: string): Promise<Reserva> => {
    const response = await axiosInstance.get<{ success: boolean; data: Reserva }>(`/api/private/reservas/${id}`);
    return response.data.data;
  },

  create: async (data: CreateReserva): Promise<Reserva> => {
    const response = await axiosInstance.post<{ success: boolean; data: Reserva }>("/api/private/reservas", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateReserva): Promise<Reserva> => {
    const response = await axiosInstance.put<{ success: boolean; data: Reserva }>(`/api/private/reservas/${id}`, data);
    return response.data.data;
  },

  updateEstado: async (id: string, data: UpdateEstadoReserva): Promise<Reserva> => {
    const response = await axiosInstance.patch<{ success: boolean; data: Reserva }>(`/api/private/reservas/${id}/estado`, data);
    return response.data.data;
  },

  cancel: async (id: string, data: CancelReserva): Promise<Reserva> => {
    const response = await axiosInstance.patch<{ success: boolean; data: Reserva }>(`/api/private/reservas/${id}/cancel`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/private/reservas/${id}`);
  },
};

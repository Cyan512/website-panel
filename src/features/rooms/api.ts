import axiosInstance from "@/config/axios/axios.instance";
import type { Habitacion, CreateHabitacionDto, UpdateHabitacionDto, UpdateEstadoHabitacionDto, TipoHabitacion, CreateTipoHabitacionDto, UpdateTipoHabitacionDto } from "./types";

export const roomsApi = {
  getAll: async (): Promise<Habitacion[]> => {
    const response = await axiosInstance.get<{ data: Habitacion[] }>("/api/habitaciones");
    return response.data.data;
  },

  getById: async (id: string): Promise<Habitacion> => {
    const response = await axiosInstance.get<{ data: Habitacion }>(`/api/habitaciones/${id}`);
    return response.data.data;
  },

  create: async (data: CreateHabitacionDto): Promise<Habitacion> => {
    const cleanData: Record<string, unknown> = {
      nro_habitacion: data.nro_habitacion,
      tipo_habitacion_id: data.tipo_habitacion_id,
      piso: data.piso,
    };
    if (data.url_imagen) cleanData.url_imagen = data.url_imagen;
    if (data.estado) cleanData.estado = data.estado;
    if (data.notas) cleanData.notas = data.notas;

    const response = await axiosInstance.post<{ data: Habitacion }>("/api/habitaciones", cleanData);
    return response.data.data;
  },

  update: async (id: string, data: UpdateHabitacionDto): Promise<Habitacion> => {
    const response = await axiosInstance.put<{ data: Habitacion }>(`/api/habitaciones/${id}`, data);
    return response.data.data;
  },

  updateEstado: async (id: string, data: UpdateEstadoHabitacionDto): Promise<Habitacion> => {
    const response = await axiosInstance.patch<{ data: Habitacion }>(`/api/habitaciones/${id}/estado`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/habitaciones/${id}`);
  },
};

export const tiposHabitacionApi = {
  getAll: async (): Promise<TipoHabitacion[]> => {
    const response = await axiosInstance.get<{ data: TipoHabitacion[] }>("/api/tipos-habitacion");
    return response.data.data;
  },

  getById: async (id: string): Promise<TipoHabitacion> => {
    const response = await axiosInstance.get<{ data: TipoHabitacion }>(`/api/tipos-habitacion/${id}`);
    return response.data.data;
  },

  create: async (data: CreateTipoHabitacionDto): Promise<TipoHabitacion> => {
    const response = await axiosInstance.post<{ data: TipoHabitacion }>("/api/tipos-habitacion", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateTipoHabitacionDto): Promise<TipoHabitacion> => {
    const response = await axiosInstance.put<{ data: TipoHabitacion }>(`/api/tipos-habitacion/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/tipos-habitacion/${id}`);
  },
};

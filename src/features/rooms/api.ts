import axiosInstance from "@/config/axios/axios.instance";
import type { Habitacion, CreateHabitacion, UpdateHabitacion, UpdateEstadoHabitacion, TipoHabitacion, CreateTipoHabitacion, UpdateTipoHabitacion } from "./types";

export const roomsApi = {
  getAll: async (): Promise<Habitacion[]> => {
    const response = await axiosInstance.get<{ data: Habitacion[] }>("/api/private/habitaciones");
    return response.data.data;
  },

  getById: async (id: string): Promise<Habitacion> => {
    const response = await axiosInstance.get<{ data: Habitacion }>(`/api/private/habitaciones/${id}`);
    return response.data.data;
  },

  create: async (data: CreateHabitacion): Promise<Habitacion> => {
    const form = new FormData();
    form.append("nro_habitacion", data.nro_habitacion);
    form.append("tipo_habitacion_id", data.tipo_habitacion_id);
    form.append("piso", String(data.piso));
    form.append("tiene_ducha", String(data.tiene_ducha));
    form.append("tiene_banio", String(data.tiene_banio));
    form.append("ulti_limpieza", data.ulti_limpieza);
    if (data.estado) form.append("estado", data.estado);
    if (data.notas) form.append("notas", data.notas);
    if (data.imagenes) data.imagenes.forEach((f) => form.append("imagenes", f));
    console.log("piso type:", typeof data.piso, "valor:", data.piso);
    console.log("piso en FormData:", form.get("piso"), typeof form.get("piso"));
    const response = await axiosInstance.post<{ data: Habitacion }>("/api/private/habitaciones", form);
    return response.data.data;
  },

  update: async (id: string, data: UpdateHabitacion): Promise<Habitacion> => {
    const form = new FormData();
    
    if (data.nro_habitacion) form.append("nro_habitacion", data.nro_habitacion);
    form.append("tipo_habitacion_id", data.tipo_habitacion_id);
    if (data.piso !== undefined) form.append("piso", String(data.piso));
    form.append("tiene_ducha", String(data.tiene_ducha));
    form.append("tiene_banio", String(data.tiene_banio));
    form.append("ulti_limpieza", data.ulti_limpieza);
    if (data.estado) form.append("estado", data.estado);
    if (data.notas) form.append("notas", data.notas);
    
    if (data.imagenes && data.imagenes.length > 0) {
        const imagenesValidas = data.imagenes.filter(img => img instanceof File && img.size > 0);
        imagenesValidas.forEach((f) => form.append("imagenes", f));
    }
    
    console.log("FormData a enviar:");
    form.forEach((value, key) => {
        if (key === "imagenes") {
            console.log(key, "File:", value instanceof File ? value.name : value);
        } else {
            console.log(key, value);
        }
    });

    console.log("piso type:", typeof data.piso, "valor:", data.piso);
    console.log("piso en FormData:", form.get("piso"), typeof form.get("piso"));
    
    const response = await axiosInstance.put<{ data: Habitacion }>(
        `/api/private/habitaciones/${id}`, form).catch(err => {
        console.log("Error completo:", err.response?.data);
        throw err;
    });
    
    return response.data.data;
  },

  updateEstado: async (id: string, data: UpdateEstadoHabitacion): Promise<Habitacion> => {
    const response = await axiosInstance.patch<{ data: Habitacion }>(`/api/private/habitaciones/${id}/estado`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/private/habitaciones/${id}`);
  },
};

export const tiposHabitacionApi = {
  getAll: async (): Promise<TipoHabitacion[]> => {
    const response = await axiosInstance.get<{ data: TipoHabitacion[] }>("/api/private/tipos-habitacion");
    return response.data.data;
  },

  getById: async (id: string): Promise<TipoHabitacion> => {
    const response = await axiosInstance.get<{ data: TipoHabitacion }>(`/api/private/tipos-habitacion/${id}`);
    return response.data.data;
  },

  create: async (data: CreateTipoHabitacion): Promise<TipoHabitacion> => {
    const response = await axiosInstance.post<{ data: TipoHabitacion }>("/api/private/tipos-habitacion", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateTipoHabitacion): Promise<TipoHabitacion> => {
    const response = await axiosInstance.put<{ data: TipoHabitacion }>(`/api/private/tipos-habitacion/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/private/tipos-habitacion/${id}`);
  },
};
